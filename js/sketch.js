
const path_to_file = "vectors/data_3d_vector_result3.json";

var camera, scene, group, scenelight, renderer, controls;
var cameraSpeed = 0;

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2(), INTERSECTED;
var spheres = [];

var group, textMesh1, textMesh2, textGeo, materials;

const mapping_range = 200.;

var prevTime = performance.now();
var velocity = new THREE.Vector3();
var direction = new THREE.Vector3();

var data;
var words_array;

preload();

function preload() {
  var xobj = new XMLHttpRequest();
  xobj.open('GET', path_to_file);
  xobj.responseType = "json";
  xobj.send();
  xobj.onload = function() {
    data = xobj.response;
    init();
  }
}

function init() {
  words_array = Object.keys(data);
  let xyz = {}
  //console.log(words_array);
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000000);
  camera.position.set(-5, -5, 60);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  for (let i = 0; i < words_array.length; i++) {
    let word = words_array[i];
    if (data[word].keyword == true) {
      color = 0xff69b4
      material = new THREE.MeshPhongMaterial( {
        color: color,
        specular: 0x050505,
        shininess: 100,
        opacity: 0.5
      });
      let geo = new THREE.SphereGeometry( 0.18, 32, 32 );
      let x = (data[word].vec[0]);
      let y = (data[word].vec[1]);
      let z = (data[word].vec[2]);

      let mappedX = Math.floor(mapping(x, -17., 18., -mapping_range, mapping_range));
      let mappedY = Math.floor(mapping(y, -17., 18., -mapping_range, mapping_range));
      let mappedZ = Math.floor(mapping(z, -17., 18., -mapping_range/2., mapping_range));

      let sphere = new THREE.Mesh( geo, material );
      sphere.position.set(mappedX,mappedY,mappedZ)
      sphere.text = word

      scene.add( sphere );
      spheres.push( sphere );
      if (word = "global cash card") {
        xyz["x"] = mappedX;
        xyz["y"] = mappedY;
        xyz["z"] = mappedZ;
      }
    } else {
      color = 0x000000
      material = new THREE.MeshPhongMaterial( {
        color: color,
        specular: 0x050505,
        shininess: 100,
        opacity: 0.3,
        transparent: true
      });
      let geo = new THREE.SphereGeometry( 0.09, 32, 32 );
      let x = (data[word].vec[0]);
      let y = (data[word].vec[1]);
      let z = (data[word].vec[2]);

      let mappedX = Math.floor(mapping(x, -17., 18., -mapping_range, mapping_range));
      let mappedY = Math.floor(mapping(y, -17., 18., -mapping_range, mapping_range));
      let mappedZ = Math.floor(mapping(z, -17., 18., -mapping_range/2., mapping_range));

      let sphere = new THREE.Mesh( geo, material );
      sphere.position.set(mappedX,mappedY,mappedZ)
      sphere.text = word

      scene.add( sphere );
      spheres.push( sphere );
    }
  }
  scene.fog = new THREE.Fog(0xf0f0f0, 0, 850);

  scenelight = new THREE.AmbientLight(0x404040);
  scene.add(scenelight);

  var axesHelper = new THREE.AxesHelper( 10 );
  console.log(xyz["x"])
  axesHelper.position.set(xyz["x"],xyz["y"],xyz["z"]);
  scene.add( axesHelper );

  // var loader = new THREE.FontLoader();
  //
  // loader.load( 'fonts/helvetiker_regular.typeface.json', function ( font ) {
  //   for (let i = 0; i < words_array.length; i++) {
  //     let message = words_array[i];
  //     let material, color;
  //
  //     color = 0x000000
  //     material = new THREE.MeshPhongMaterial( {
  //       color: color,
  //       specular: 0x050505,
  //       shininess: 100,
  //       opacity: 0.3,
  //       transparent: true
  //     });
  //     let geo = new THREE.SphereGeometry( 0.3, 32, 32 );
  //     let x = (data[message][0][0]);
  //     let y = (data[message][0][1]);
  //     let z = (data[message][0][2]);
  //
  //     let mappedX = Math.floor(mapping(x, -17., 18., -mapping_range, mapping_range));
  //     let mappedY = Math.floor(mapping(y, -17., 18., -mapping_range, mapping_range));
  //     let mappedZ = Math.floor(mapping(z, -17., 18., -mapping_range/2., mapping_range));
  //
  //     let sphere = new THREE.Mesh( geo, material );
  //     sphere.position.set(mappedX,mappedY,mappedZ)
  //     sphere.text = message
  //
  //     scene.add( sphere );
  //     spheres.push( sphere );
  //
  //
  //     // for (let i = 0; i < vecs.length; i++) {
  //     //   if (message == vecs[i][0]) {
  //     //     var shapes = font.generateShapes( message, 0.25 );
  //     //     var geometry = new THREE.ShapeBufferGeometry( shapes );
  //     //     geometry.computeBoundingBox();
  //     //     xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
  //     //     geometry.translate( xMid, 0, 0 );
  //     //     // make shape ( N.B. edge view not visible )
  //     //     text = new THREE.Mesh( geometry, material );
  //     //     text.position.set(mappedX,mappedY-2,mappedZ);
  //     //     scene.add( text );
  //     //   } else {
  //     //     geo = new THREE.SphereGeometry( 0.2, 32, 32 );
  //     //   }
  //     }
  //   }
  // });

  renderer = new THREE.WebGLRenderer({});
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  window.addEventListener('resize', onWindowResize, false);
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );

  controls = new THREE.OrbitControls( camera, renderer.domElement );
  controls.target.set( 0, 1, 0 );
  controls.update();

  //window.addEventListener( "mousemove", onDocumentMouseMove, false );

  animate();
} // end init

function animate() {
  requestAnimationFrame(animate);

  raycaster.setFromCamera( mouse, camera );
  var intersects = raycaster.intersectObjects( spheres );
  if ( intersects.length > 0 ) {
    if ( INTERSECTED != intersects[ 0 ].object ) {
      if ( INTERSECTED)
      INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
      INTERSECTED = intersects[ 0 ].object;
      INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
      INTERSECTED.material.emissive.setHex( 0xff0000 );
      let element = document.getElementById("txt");
      element.innerHTML = INTERSECTED.text;

    }
  } else {
    if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
    INTERSECTED = null;
  }

  render();
}

function render() {
  controls.update();
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove( event ) {
  event.preventDefault();
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}


function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function mapping(n, start1, stop1, start2, stop2) {
  return ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
}
