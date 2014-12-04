/*
 * https://github.com/mrdoob/three.js/blob/2d59713328c421c3edfc3feda1b116af13140b94/src/extras/audio/Audio.js
 * https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode
 */

var Sound;

Sound = ( function() {
  function Sound( scene, camera ) {
    this.scene = scene;
    this.listener = new THREE.AudioListener();
    camera.add( this.listener );
  }

  Sound.prototype.play = function( url ) {
    if( url ) {
      this.remove();
      var sound = new THREE.Audio( this.listener );
      sound.load( 'audio/' + url );
      sound.setLoop( true );
      sound.position.set( 1, 1, 1 );
      sound.setRefDistance( 1 );
      this.scene.add( sound );
      this.sound = sound;
    } else {
      if( this.sound ) {
        this.sound.source.start( 0 );
      }
    }
  };

  Sound.prototype.stop = function() {
    if( this.sound ) {
      this.sound.source.stop();
    }
  };

  Sound.prototype.remove = function() {
    if( this.sound ) {
      this.scene.remove( this.sound );
      this.sound = null;
    }
  };

  return Sound;

} )();
