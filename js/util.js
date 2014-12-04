var Util = {};

Util.parseURLSearch = function () {
  var parameters = {};
  var parts = window.location.search.substr( 1 ).split( '&' );
  for ( var i = 0; i < parts.length; i ++ ) {
    var parameter = parts[ i ].split( '=' );
    parameters[ parameter[ 0 ] ] = parameter[ 1 ];
  }
  return parameters;
};


/*
 * https://github.com/mrdoob/three.js/blob/2d59713328c421c3edfc3feda1b116af13140b94/src/extras/audio/Audio.js
 * https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode
 */

Util.playAudio = function( url, listener ) {
  var sound = new THREE.Audio( listener );
  sound.load( url );
  sound.position.set( 1, 1, 1 );
  sound.setLoop( true );
  sound.setRefDistance( 1 );
  return sound;
};

Util.stopAudio = function( sound ) {
  if( sound ) {
    sound.source.stop();
  }
};


// fragment objects

Util.fragment = function( geometry, material ) {

  var group = new THREE.Group();

  for ( var i = 0; i < geometry.faces.length; i ++ ) {

    var face = geometry.faces[ i ];

    var vertexA = geometry.vertices[ face.a ].clone();
    var vertexB = geometry.vertices[ face.b ].clone();
    var vertexC = geometry.vertices[ face.c ].clone();

    var geometry2 = new THREE.Geometry();
    geometry2.vertices.push( vertexA, vertexB, vertexC );
    geometry2.faces.push( new THREE.Face3( 0, 1, 2 ) );

    var mesh = new THREE.Mesh( geometry2, material );
    mesh.position.sub( geometry2.center() );
    group.add( mesh );

  }

  return group;

};


// bend function

Util.bend = function( group, amount, multiMaterialObject ) {

  function bendVertices( mesh, amount, parent ) {

    var vertices = mesh.geometry.vertices;

    if (!parent) {
      parent = mesh;
    }

    for (var i = 0; i < vertices.length; i++) {
      var vertex = vertices[i];

      // apply bend calculations on vertexes from world coordinates
      parent.updateMatrixWorld();

      var worldVertex = parent.localToWorld(vertex);

      var worldX = Math.sin( worldVertex.x / amount) * amount;
      var worldZ = - Math.cos( worldVertex.x / amount ) * amount;
      var worldY = worldVertex.y  ;

      // convert world coordinates back into local object coordinates.
      var localVertex = parent.worldToLocal(new THREE.Vector3(worldX, worldY, worldZ));
      vertex.x = localVertex.x;
      vertex.z = localVertex.z+amount;
      vertex.y = localVertex.y;
    };

    mesh.geometry.computeBoundingSphere();
    mesh.geometry.verticesNeedUpdate = true;
  }

  for ( var i = 0; i < group.children.length; i ++ ) {


    var element = group.children[ i ];

    if (element.geometry.vertices) {
      if (multiMaterialObject) {
        bendVertices( element, amount, group);
      } else {
        bendVertices( element, amount);
      }
    }

    // if (element.userData.position) {
    //  element.position.x = Math.sin( element.userData.position.x / amount ) * amount;
    //  element.position.z = - Math.cos( element.userData.position.x / amount ) * amount;
    //  element.lookAt( vector.set( 0, element.position.y, 0 ) );
    // }
  }
};
