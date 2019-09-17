
const path_to_file = "vectors/data_3d_vector_result2.json";

var camera, scene, group, scenelight, renderer, controls;
var cameraSpeed = 0;

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2(), INTERSECTED;

var group, textMesh1, textMesh2, textGeo, materials;

const mapping_range = 400.;

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
  //console.log(words_array);
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000000);
  camera.position.set(0, -0, 150);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  var plane = new THREE.GridHelper(400, 50);
  plane.position.set(0,-20,0);
  scene.add(plane);
  scene.fog = new THREE.Fog(0xf0f0f0, 0, 850);

  scenelight = new THREE.AmbientLight(0x404040);
  scene.add(scenelight);

  var loader = new THREE.FontLoader();

  loader.load( 'fonts/helvetiker_regular.typeface.json', function ( font ) {
    for (var i = 0; i < words_array.length; i++) {
      let message = words_array[i];
      let geo = new THREE.SphereGeometry( 0.5, 32, 32 );

      let x = (data[message][0][0]);
      let y = (data[message][0][1]);
      let z = (data[message][0][2]);

      let mappedX = Math.floor(mapping(x, -17., 18., -mapping_range, mapping_range));
      let mappedY = Math.floor(mapping(y, -17., 18., -mapping_range, mapping_range));
      let mappedZ = Math.floor(mapping(z, -17., 18., -mapping_range/2., mapping_range));

      let sphere = new THREE.Mesh( geo, material );
      let color = data[message][1];
      // var material = new THREE.MeshPhongMaterial({
      //   color: color,
      //   shininess: 35,
      //
      //   transparent: true,
      //   side: THREE.DoubleSide
      // });
      var material = new THREE.MeshPhongMaterial( {
        color: color,
        specular: 0x050505,
        shininess: 100
      })
      sphere.position.set(mappedX,mappedY,mappedZ)
      sphere.type = "sphere"

      scene.add( sphere );

      var shapes = font.generateShapes( message, 0.25 );
      var geometry = new THREE.ShapeBufferGeometry( shapes );
      geometry.computeBoundingBox();
      xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
      geometry.translate( xMid, 0, 0 );
      // make shape ( N.B. edge view not visible )
      text = new THREE.Mesh( geometry, material );
      text.position.set(mappedX,mappedY-2,mappedZ);
      scene.add( text );
    }
  });

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

  // raycaster.setFromCamera( mouse, camera );
  // var intersects = raycaster.intersectObjects( scene.children );
  // if ( intersects.length > 0 ) {
  //   console.log(intersects)
  //   if ( INTERSECTED != intersects[ 0 ].object ) {
  //     if ( INTERSECTED &&  intersects[ 0 ].object.type == "sphere")
  //     INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
  //     INTERSECTED = intersects[ 0 ].object;
  //     INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
  //     INTERSECTED.material.emissive.setHex( 0xff0000 );
  //   }
  // } else {
  //   if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
  //   INTERSECTED = null;
  // }

  render();
}

function render() {
  controls.update();
  // var _time = Date.now() * 0.001;
  // if (controlsEnabled === true) {
  //
  //     var time = performance.now();
  //     var delta = (time - prevTime) / 1000;
  //     velocity.x -= velocity.x * 5.0 * delta;
  //     velocity.z -= velocity.z * 1.0 * delta;
  //     velocity.y -= velocity.y *5.0 *delta;
  //     // velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
  //     direction.z = Number(moveForward) - Number(moveBackward);
  //     direction.x = Number(moveLeft) - Number(moveRight);
  //     direction.y = Number(moveDown) - Number(moveUp);
  //     direction.normalize(); // this ensures consistent movements in all directions
  //     if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
  //     if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;
  //     if(moveUp||moveDown) velocity.y -= direction.y *400 * delta;
  //
  //     controls.getObject().translateX(velocity.x * delta);
  //     controls.getObject().translateY(velocity.y * delta);
  //     controls.getObject().translateZ(velocity.z * delta);
  //     // if (controls.getObject().position.y < 10) {
  //     //     velocity.y = 0;
  //     //     controls.getObject().position.y = 10;
  //     // }
  //     prevTime = time;
  // }

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
