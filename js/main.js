
var camera, scene, renderer;var vrEffect;
var vrControls;
var counter = 0;
var pano, controls, cursor, effect;
var sound; // Sound class -> sound.js
var overlay, secondoverlay; // Overlay class -> overlay.js

function init() {

  //setup

  var geometry = new THREE.SphereGeometry( 1000, 60, 60 );
  geometry.applyMatrix( new THREE.Matrix4().makeScale( -1, 1, 1 ) );
  var material = new THREE.MeshBasicMaterial( {
    side: THREE.DoubleSide,
    transparent: true,
    map: THREE.ImageUtils.loadTexture( 'images/background.jpg', THREE.UVMapping, function(){
      VRClient.ready();
      loadPano();
    } )
  } );

  pano = new THREE.Mesh( geometry, material );
  pano.renderDepth = 2;
  pano.rotation.set( 0, -90 * Math.PI / 180, 0 );

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.autoClear = false;
  renderer.setClearColor( 0x000000 );
  document.body.appendChild( renderer.domElement );
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );

  // cursor

  cursor = new VRCursor();
  cursor.ready.then( function() {
    scene.add( cursor.layout );
    cursor.init( renderer.domElement, camera, scene );
    cursor.enable();
  } );

  // parse url parameter and set appropriate rendering effect.

  controls = new THREE.VRControls( camera );
  effect = new THREE.VREffect( renderer );

  // listen for double clicks to initiate full-screen/VR mode.

  document.body.addEventListener( 'dblclick', function () {
    effect.setFullScreen( true );
  } );

  // sound

  sound = new Sound( scene, camera );

  scene.add( pano );

  overlay = new Overlay(scene);
  secondoverlay = new Overlay(scene);

  overlay.setPosition( 0, -3, -5 );
  overlay.setScale( 0.1, 0.1, 0.1 );
  overlay.setBend( 100 );

  secondoverlay.setPosition( 0, -3, 5 );
  secondoverlay.setScale( 0.1, 0.1, 0.1 );
  secondoverlay.setBend( -100 );

  window.addEventListener( 'resize', onWindowResize, false );
  window.addEventListener( 'keydown', onkey, false);
  window.addEventListener('keyup', function(event) { key(event, -1); }, false);
}


function key(event, sign) {
  var control = controls.manualControls[String.fromCharCode(event.keyCode).toLowerCase()];
  if (!control) return;
  if (sign === 1 && control.active || sign === -1 && !control.active) return;
  control.active = (sign === 1);
  controls.manualRotateRate[control.index] += sign * control.sign;
}


function loadPano() {

  sound.stop();

  var imgPano = 'images/' + panos[counter].image;
  var imgOverlay = panos[counter].overlay.url;
  var imgSecondOverlay = panos[counter].secondoverlay.url;
  var audioUrl = panos[counter].audio;

  // load pano

  new TWEEN.Tween( pano.material )
    .to({ opacity: 0 }, 300 )
    .onComplete(function() {

      pano.material.map = THREE.ImageUtils.loadTexture( imgPano, THREE.UVMapping, function() {

        new TWEEN.Tween( pano.material )
          .to( { opacity: 1 }, 1000 )
          .onComplete( function(){

            overlay.show( 300 );
            secondoverlay.show( 300 );

          } )
          .start();

        sound.play( audioUrl );

      } );
    } )
    .start();

  // load overlay

  overlay.hide( 300, function() {
    overlay.loadTexture( imgOverlay );
  } );

  secondoverlay.hide( 300, function() {
    secondoverlay.loadTexture( imgSecondOverlay );
  } );

}










function onkey( event ) {

  if ( !( event.metaKey || event.altKey || event.ctrlKey ) ) {
    event.preventDefault();
  }

  if ( event.charCode == 'z'.charCodeAt(0) ) {

    //zero sensor
    VRClient.zeroSensor();

  } else if ( event.keyCode == '37' ) {

    counter --;

    if( counter < 0 ) {
      counter = panos.length - 1;
    }
    ///test
    loadPano();

  } else if ( event.keyCode == '39' ) {

    counter ++;

    if( counter == panos.length ) {
      counter = 0;
    }

    loadPano();

  } else {

    key(event, 1);

  }

  event.stopPropagation();

}


function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  effect.setSize( window.innerWidth, window.innerHeight );
}


function animate() {
  requestAnimationFrame( animate );
  render();
  TWEEN.update();
}


function render() {
  controls.update();
  if ( cursor.enabled ) cursor.updatePosition();
  effect.render( scene, camera );
}



init();
onWindowResize();
animate();
