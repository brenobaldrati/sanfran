


var parameters = Util.parseURLSearch();

var camera, scene, renderer;
var vrEffect;
var vrControls;
var counter = 0;
var pano, overlay, listener, sound, controls;


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

  listener = new THREE.AudioListener();
  camera.add( listener );


  scene.add( pano );

  overlay = new THREE.Object3D();
  secondoverlay = new THREE.Object3D();

  var mesh = new THREE.Mesh(
    new THREE.PlaneGeometry( 63, 30, 20, 20 ),
    new THREE.MeshBasicMaterial( { transparent: true, opacity: 1, side: THREE.DoubleSide, map: THREE.ImageUtils.loadTexture( 'images/background-overlay.png' ) } )
  );


  overlay.add( mesh );
  overlay.position.set( 0, -3, -5 );
  overlay.scale.set( 0.1, 0.1, 0.1 );

  // secondoverlay.add( mesh);
  // secondoverlay.position.set(0,-2, -4);
  // secondoverlay.scale.set(0.1,0.1,0.1);

  Util.bend(overlay, 100);
  mesh.renderDepth = 1;
  scene.add( overlay );

  // Util.bend(secondoverlay, 100);
  // mesh.renderDepth = 1;
  // scene.add( secondoverlay );


  window.addEventListener( 'keydown', onkey, true);
  window.addEventListener( 'resize', onWindowResize, false );

  document.addEventListener('keydown', function(event) { key(event, 1); }, false);
  document.addEventListener('keyup', function(event) { key(event, -1); }, false);
}


function key(event, sign) {
    console.log('key');
    var control = controls.manualControls[String.fromCharCode(event.keyCode).toLowerCase()];
    // control = {index: 1, sign: 1, active: 0}
    console.log(control);
    if (!control)
        return;
    if (sign === 1 && control.active || sign === -1 && !control.active)
        return;
    control.active = (sign === 1);
    // control = {index: 1, sign: 1, active: 1}
    controls.manualRotateRate[control.index] += sign * control.sign;
}


function loadPano() {

  Util.stopAudio( sound );

  var imgPano = 'images/' + panos[counter].image;
  var imgOverlay = 'images/' + panos[counter].overlay;
  // var imgSecondOverlay = 'images/' + panos[counter].secondoverlay;
  var audio = 'audio/' + panos[counter].audio;

  // load pano

  new TWEEN.Tween( pano.material )
    .to({ opacity: 0}, 300 )
    .onComplete(function() {

      pano.material.map = THREE.ImageUtils.loadTexture( imgPano, THREE.UVMapping, function() {

        new TWEEN.Tween( pano.material )
          .to({ opacity: 1}, 1000)
          .onComplete( function(){

            new TWEEN.Tween( overlay.children[0].material )
              .to({ opacity: 1}, 300 )
              .start();

          })
          .start();


        sound = Util.playAudio( audio, listener );
        scene.add( sound );

      });
    })
    .start();

  // load overlay

  new TWEEN.Tween( overlay.children[0].material )
    .to({ opacity: 0}, 300 )
    .onComplete( function(){

      overlay.children[0].material.map = THREE.ImageUtils.loadTexture( imgOverlay, THREE.UVMapping );

    })
    .start();

    // load SecondOverlay
    //
    // new TWEEN.Tween( overlay.children[0].material )
    // .to({ opacity: 0}, 300 )
    // .onComplete( function(){
    //
    //     overlay.children[0].material.map = THREE.ImageUtils.loadTexture( imgSecondOverlay, THREE.UVMapping );
    //
    // })
    // .start();

}










function onkey( event ) {

  if (!(event.metaKey || event.altKey || event.ctrlKey)) {
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
  effect.render( scene, camera );
}





init();
animate();
