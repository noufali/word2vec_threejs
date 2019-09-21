
const path_to_file = "vectors/new_vecs.json";

var camera, scene, group, scenelight, renderer, controls;
var cameraSpeed = 0;

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2(), INTERSECTED;
var spheres = [];

var group, textMesh1, textMesh2, textGeo, materials;

const mapping_range = 10.;

var prevTime = performance.now();
var velocity = new THREE.Vector3();
var direction = new THREE.Vector3();

var data;
var words_array = [];
var toggle = "keywords";

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
  //words_array = Object.keys(data);
  let xyz = {}
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000000);
  camera.position.set(-90,79,147);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  for (let i = 0; i < data.length; i++) {
    let word = data[i].keyword;
    color = 0xC0382A
    material = new THREE.MeshPhongMaterial( {
      color: color,
      specular: 0xC0382A,
      shininess: 100,
    });
    let geo = new THREE.SphereGeometry( 5, 32, 32 );
    let x = (data[i].vec[0]);
    let y = (data[i].vec[1]);
    let z = (data[i].vec[2]);

    let mappedX = Math.floor(mapping(x, -17., 18., -mapping_range, mapping_range));
    let mappedY = Math.floor(mapping(y, -17., 18., -mapping_range, mapping_range));
    let mappedZ = Math.floor(mapping(z, -17., 18., -mapping_range/2., mapping_range));

    let sphere = new THREE.Mesh( geo, material );
    sphere.position.set(x,y,z)
    sphere.text = word;
    sphere.keyword = true;
    sphere.data = data[i].data;
    sphere.similarity = data[i].similarity;

    scene.add( sphere );
    spheres.push( sphere );
    if (word = "global cash card") {
      xyz["x"] = mappedX;
      xyz["y"] = mappedY;
      xyz["z"] = mappedZ;
    }
    let sims = data[i].similarity;
    for (let s = 0; s < sims.length; s++ ) {
      let word2 = sims[s].word;
      let c2 = 0x828282
      material2 = new THREE.MeshPhongMaterial( {
        color: c2,
        specular: 0x050505,
        shininess: 100,
        opacity: 0.3,
        transparent: true
      });
      let geo2 = new THREE.SphereGeometry( 2, 32, 32 );
      let x2 = (sims[s].vec[0]);
      let y2 = (sims[s].vec[1]);
      let z2 = (sims[s].vec[2]);

      let mappedX2 = Math.floor(mapping(x2, -17., 18., -mapping_range, mapping_range));
      let mappedY2 = Math.floor(mapping(y2, -17., 18., -mapping_range, mapping_range));
      let mappedZ2 = Math.floor(mapping(z2, -17., 18., -mapping_range/2., mapping_range));

      let sphere2 = new THREE.Mesh( geo2, material2 );
      sphere2.position.set(x2,y2,z2);
      sphere2.text = word2;
      sphere2.keyword = false;
      sphere2.data = data[i].data;

      scene.add( sphere2 );
      spheres.push( sphere2 );
    }
  }

  scene.fog = new THREE.Fog(0xf0f0f0, 0, 850);

  //scenelight = new THREE.AmbientLight(0x404040);
  scenelight = new THREE.AmbientLight(0xffffff);
  scene.add(scenelight);

  var axesHelper = new THREE.AxesHelper( 40 );
  axesHelper.position.set(0,0,0);
  scene.add( axesHelper );


  // for (let i = 0; i < vecs.length; i++) {
  //   if (message == vecs[i][0]) {
  //     var shapes = font.generateShapes( message, 0.25 );
  //     var geometry = new THREE.ShapeBufferGeometry( shapes );
  //     geometry.computeBoundingBox();
  //     xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
  //     geometry.translate( xMid, 0, 0 );
  //     // make shape ( N.B. edge view not visible )
  //     text = new THREE.Mesh( geometry, material );
  //     text.position.set(mappedX,mappedY-2,mappedZ);
  //     scene.add( text );
  //   } else {
  //     geo = new THREE.SphereGeometry( 0.2, 32, 32 );
  //   }

  renderer = new THREE.WebGLRenderer({});
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  window.addEventListener('resize', onWindowResize, false);
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );

  controls = new THREE.OrbitControls( camera, renderer.domElement );
  controls.target.set( 0, 1, 0 );
  //controls.target.set(xyz["x"],xyz["y"],xyz["z"]);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.rotateSpeed = 0.4;
  controls.zoomSpeed = 0.8;
  controls.minDistance = 10;
  controls.maxDistance = 400;
  controls.update();

  //window.addEventListener( "mousemove", onDocumentMouseMove, false );

  animate();
} // end init

function bindButtons(){
  let buttons = $('#update button');

  buttons.on('click', function(e){
    var $this = $(this);

    if($this.attr('id') == 'interviews'){
      $this.attr("status","active");
      $(this).css('backgroundColor','#E16C63');

      for(let i=0;i<spheres.length;i++) {
        if (spheres[i].data == "interviews") {
          spheres[i].material.color.setHex( 0xE16C63 );
        } else {
          spheres[i].material.color.setHex( 0x828282 );
        }
      }

      $('#articles').attr("status","inactive");
      $('#keywords').attr("status","inactive");
      $('#articles').css('backgroundColor','#828282');
      $('#keywords').css('backgroundColor','#828282');
    }

    if($this.attr('id') == 'articles') {
      $this.attr("status","active");
      $(this).css('backgroundColor','#EEAF8A');

      for(let i=0;i<spheres.length;i++) {
        if (spheres[i].data == "articles") {
          spheres[i].material.color.setHex( 0xEEAF8A );
        } else {
          spheres[i].material.color.setHex( 0x828282 );
        }
      }

      $('#interviews').attr("status","inactive");
      $('#keywords').attr("status","inactive");
      $('#interviews').css('backgroundColor','#828282');
      $('#keywords').css('backgroundColor','#828282');
    }

    if($this.attr('id') == 'keywords') {
      $this.attr("status","active");
      $(this).css('backgroundColor','#C0382A');

      for(let i=0;i<spheres.length;i++) {
        if (spheres[i].keyword == true) {
          spheres[i].material.color.setHex( 0xC0382A );
        } else {
          spheres[i].material.color.setHex( 0x828282 );
        }
      }

      $('#interviews').attr("status","inactive");
      $('#artciles').attr("status","inactive");
      $('#interviews').css('backgroundColor','#828282');
      $('#articles').css('backgroundColor','#828282');
    }
  })
}
bindButtons();

function animate() {
  requestAnimationFrame(animate);
  //console.log(camera.position);

  raycaster.setFromCamera( mouse, camera );
  var intersects = raycaster.intersectObjects( spheres, true );
  if ( intersects.length > 0 ) {
    if ( INTERSECTED != intersects[ 0 ].object ) {
      if ( INTERSECTED)
      //INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
      INTERSECTED.material.color.setHex( INTERSECTED.colourHex );
      INTERSECTED = intersects[ 0 ].object;
      INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
      INTERSECTED.colourHex = INTERSECTED.material.color.getHex();
      //INTERSECTED.material.emissive.setHex( 0x131D4B );
      INTERSECTED.material.color.setHex( 0x131D4B );
      let element = document.getElementById("txt");
      element.innerHTML = INTERSECTED.text;

      if (INTERSECTED.keyword == true){
        for (let s = 1; s < 6; s++) {
          let key = INTERSECTED.similarity;
          let similar = document.getElementById("s" + s);
          similar.innerHTML = key[s].word + ", " + key[s].cosine.toFixed(4);
        }
      }
      if (INTERSECTED.keyword == false){
        for (let s = 1; s < 6; s++) {
          let similar = document.getElementById("s" + s);
          similar.innerHTML = " "
        }
      }
    }
  } else {
    //if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
    if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.colourHex );


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
