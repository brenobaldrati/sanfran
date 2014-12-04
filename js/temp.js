svar camera, scene, renderer;
var controls, effect;

var geometry, material, cube;

init();
animate();

function init() {

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.autoClear = false;
  renderer.setClearColor( 0x000000 );
  document.body.appendChild( renderer.domElement );
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );

  // parse url parameter and set appropriate rendering effect.

  if ( parameters.mode === 'cardboard' ) {
    controls = new THREE.DeviceOrientationControls( camera );
    effect = new THREE.StereoEffect( renderer );
  } else {
    controls = new THREE.VRControls( camera );
    effect = new THREE.VREffect( renderer );
  }
  effect.setSize( window.innerWidth, window.innerHeight );


  // listen for double clicks to initiate full-screen/VR mode.

  document.body.addEventListener( 'dblclick', function () {
    effect.setFullScreen( true );
  } );

  //add background sound

  var listener = new THREE.AudioListener();
  camera.add( listener );

  // add background sphere to scene and apply image

  var geometry = new THREE.SphereGeometry( 500, 60, 60 );
  geometry.applyMatrix( new THREE.Matrix4().makeScale( -1, 1, 1 ) );


  var material = new THREE.MeshBasicMaterial( {
    map: THREE.ImageUtils.loadPanoture( 'images/puydesancy.jpg', new THREE.UVMapping(), function(){



        var sound = new THREE.Audio( listener );
        sound.load( 'audio/235428__allanz10d__calm-ocean-breeze-simulation.ogg' );
        sound.position.set( 1, 1, 1 );
        sound.setLoop( true );
        sound.setRefDistance( 1 );
        scene.add( sound );

        // announce to JAVRIS host that we are ready to go.
        setTimeout( function() {
          VRClient.ready();
        }, 500)

    } )
  } );

  var mesh = new THREE.Mesh( geometry, material );
  mesh.rotation.set( 0, -1.57, 0 )
  scene.add( mesh );

  window.addEventListener( 'resize', onWindowResize, false );
  window.addEventListener( 'keydown', onKey, true);

}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  effect.setSize( window.innerWidth, window.innerHeight );
}

function onKey(event) {
  if (!(event.metaKey || event.altKey || event.ctrlKey)) {
    event.preventDefault();
  }

  switch (event.key) {
    case 'z': // z
      VRClient.zeroSensor();
      break;
  }
}

function animate() {

  requestAnimationFrame( animate );
  render();
}

function render() {
  controls.update();
  effect.render( scene, camera );
}
