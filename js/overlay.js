var Overlay;

Overlay = ( function() {
  function Overlay( scene ) {
    this.overlay = new THREE.Object3D();
    var mesh = new THREE.Mesh(
      new THREE.PlaneGeometry( 63, 30, 20, 20 ),
      new THREE.MeshBasicMaterial( { transparent: true, opacity: 1, side: THREE.DoubleSide, map: THREE.ImageUtils.loadTexture( 'images/background-overlay.png' ) } )
    );
    this.overlay.add( mesh );
    mesh.renderDepth = 1;
    scene.add( this.overlay );
  }

  Overlay.prototype.getObject3D = function() {
    return this.overlay;
  };

  Overlay.prototype.setPosition = function( x, y, z ) {
    this.overlay.position.set( x, y, z );
  };

  Overlay.prototype.setRotation = function( x, y, z ) {
    var p = Math.PI / 180;
    this.overlay.rotation.set( x * p , y * p, z * p );
  };

  Overlay.prototype.setScale = function( x, y, z ) {
    this.overlay.scale.set( x, y, z );
  };

  Overlay.prototype.setBend = function( amount, multiMaterialObject ) {
    var group = this.overlay;
    function bendVertices( mesh, amount, parent ) {
      var vertices = mesh.geometry.vertices;
      if ( !parent ) parent = mesh;
      for ( var i = 0; i < vertices.length; i++ ) {
        var vertex = vertices[i];
        // apply bend calculations on vertexes from world coordinates
        parent.updateMatrixWorld();
        var worldVertex = parent.localToWorld( vertex );
        var worldX = Math.sin( worldVertex.x / amount) * amount;
        var worldZ = - Math.cos( worldVertex.x / amount ) * amount;
        var worldY = worldVertex.y  ;
        // convert world coordinates back into local object coordinates.
        var localVertex = parent.worldToLocal( new THREE.Vector3( worldX, worldY, worldZ ) );
        vertex.x = localVertex.x;
        vertex.z = localVertex.z+amount;
        vertex.y = localVertex.y;
      };
      mesh.geometry.computeBoundingSphere();
      mesh.geometry.verticesNeedUpdate = true;
    }
    for ( var i = 0; i < group.children.length; i ++ ) {
      var element = group.children[ i ];
      if ( element.geometry.vertices ) {
        if ( multiMaterialObject ) {
          bendVertices( element, amount, group );
        } else {
          bendVertices( element, amount );
        }
      }
    }
  };

  Overlay.prototype.loadTexture = function(image) {
    var material = this.overlay.children[0].material;
    material.map = THREE.ImageUtils.loadTexture( 'images/' + image, THREE.UVMapping );
  };

  Overlay.prototype.show = function(time, onComplete) {
    var material = this.overlay.children[0].material;
    new TWEEN.Tween( material )
      .to({ opacity: 1 }, 300 )
      .onComplete( onComplete || function() {} )
      .start();
  };

  Overlay.prototype.hide = function(time, onComplete) {
    var material = this.overlay.children[0].material;
    new TWEEN.Tween( material )
      .to({ opacity: 0 }, 300 )
      .onComplete( onComplete || function() {} )
      .start();
  };

  return Overlay;

} )();