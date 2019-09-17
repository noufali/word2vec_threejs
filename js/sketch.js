
const path_to_file = "vectors/data_3d_vector_result2.json";

var camera, scene, group, scenelight, renderer, controls;
var cameraSpeed = 0;

var raycaster = new THREE.Raycaster();
var mouseVector = new THREE.Vector3();

var group, textMesh1, textMesh2, textGeo, materials;

const mapping_range = 100.;

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
  camera.position.set(0, -0, 10);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  group = new THREE.Group();
  scene.add( group );
  //scene.fog = new THREE.Fog(0xf0f0f0, 0, 850);

  scenelight = new THREE.AmbientLight(0x404040);
  scene.add(scenelight);

  // var geometry = new THREE.SphereGeometry( 100, 32, 32 );
  var loader = new THREE.FontLoader();

  loader.load( 'fonts/helvetiker_regular.typeface.json', function ( font ) {
    for (var i = 0; i < words_array.length; i++) {
      let message = words_array[i];
      let geo = new THREE.SphereGeometry( 1, 32, 32 );

      let x = (data[message][0][0]);
      let y = (data[message][0][1]);
      let z = (data[message][0][2]);

      let mappedX = Math.floor(mapping(x, -17., 18., -mapping_range, mapping_range));
      let mappedY = Math.floor(mapping(y, -17., 18., -mapping_range, mapping_range));
      let mappedZ = Math.floor(mapping(z, -17., 18., -mapping_range/2., mapping_range));

      let sphere = new THREE.Mesh( geo, material );
      let color = data[message][1];
      var material = new THREE.MeshPhongMaterial({
              color: color,
              shininess: 35,

              transparent: true,
              opacity: 0.4,
              side: THREE.DoubleSide
          });
      sphere.position.set(mappedX,mappedY,mappedZ)

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


  // var loader = new THREE.FontLoader();
  // loader.load('fonts/helvetiker_regular.typeface.json', function(font) {
  //
  //     var color = 0x006699;
  //     var matDark = new THREE.LineBasicMaterial({
  //         color: color,
  //         side: THREE.DoubleSide
  //     });
  //     var matLite = new THREE.MeshPhongMaterial({
  //         color: color,
  //         shininess: 35,
  //
  //         transparent: true,
  //         opacity: 0.4,
  //         side: THREE.DoubleSide
  //     });
  //     for (var i = 0; i < words_array.length; i++) {
  //         var message = words_array[i];
  //         var x = (data[message][0]);
  //         var y = (data[message][1]);
  //         var z = (data[message][2]);
  //         // var z = getRandomArbitrary(0.,400)
  //         var mappedX = Math.floor(mapping(x, -17., 18., -mapping_range, mapping_range));
  //         var mappedY = Math.floor(mapping(y, -17., 18., -mapping_range, mapping_range));
  //         var mappedZ = Math.floor(mapping(z, -17., 18., -mapping_range/2., mapping_range));
  //         generateShapeFromText(message, mappedX, mappedY, mappedZ, font, matDark, matLite);
  //     }
  // }); //end load function
  renderer = new THREE.WebGLRenderer({});
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  window.addEventListener('resize', onWindowResize, false);

  controls = new THREE.OrbitControls( camera, renderer.domElement );
  controls.target.set( 0, 1, 0 );
  controls.update();

  //window.addEventListener( "mousemove", onDocumentMouseMove, false );

  animate();
} // end init

function generateShapeFromText(_word, _xpos, _ypos, _zpos, _font, mD, mL) {
  var xMid, text;
  var textShape = new THREE.BufferGeometry();
  //text,size,divisions
  var shapes = _font.generateShapes(_word, 10, 1);
  var geometry = new THREE.ShapeGeometry(shapes);
  geometry.computeBoundingBox();
  // xMid = _pos - 0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
  // geometry.translate(xMid, 0, 0);
  geometry.translate(_xpos, _ypos, 0);
  // make shape ( N.B. edge view not visible )
  textShape.fromGeometry(geometry);
  text = new THREE.Mesh(textShape, mL);
  text.position.z = _zpos;
  scene.add(text);
  // make line shape ( N.B. edge view remains visible )
  var holeShapes = [];
  for (var i = 0; i < shapes.length; i++) {
    var shape = shapes[i];
    if (shape.holes && shape.holes.length > 0) {
      for (var j = 0; j < shape.holes.length; j++) {
        var hole = shape.holes[j];
        holeShapes.push(hole);
      }
    }
  }
  shapes.push.apply(shapes, holeShapes);
  var lineText = new THREE.Object3D();
  for (var i = 0; i < shapes.length; i++) {
    var shape = shapes[i];
    var points = shape.getPoints();
    var geometry = new THREE.BufferGeometry().setFromPoints(points);

    geometry.translate(_xpos, _ypos, 0);
    var lineMesh = new THREE.Line(geometry, mD);
    lineText.add(lineMesh);
  }
  // scene.add(lineText);
}


function animate() {
  requestAnimationFrame(animate);
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

// var selectedObject = null;
// 		function onDocumentMouseMove( event ) {
// 			event.preventDefault();
// 			if ( selectedObject ) {
// 				selectedObject.material.color.set( '#69f' );
// 				selectedObject = null;
// 			}
// 			var intersects = getIntersects( event.layerX, event.layerY );
// 			if ( intersects.length > 0 ) {
// 				var res = intersects.filter( function ( res ) {
// 					return res && res.object;
// 				} )[ 0 ];
// 				if ( res && res.object ) {
// 					selectedObject = res.object;
// 					selectedObject.material.color.set( '#f00' );
// 				}
// 			}
// 		}
//
// 		function getIntersects( x, y ) {
// 			x = ( x / window.innerWidth ) * 2 - 1;
// 			y = - ( y / window.innerHeight ) * 2 + 1;
// 			mouseVector.set( x, y, 0.5 );
// 			raycaster.setFromCamera( mouseVector, camera );
// 			return raycaster.intersectObject( group, true );
// 		}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function mapping(n, start1, stop1, start2, stop2) {
  return ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
}
