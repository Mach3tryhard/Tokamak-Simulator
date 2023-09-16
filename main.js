import * as THREE from 'three';	

const scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0xF8C8DC } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.set( 0, 0, 100 );
camera.lookAt( 0, 0, 0 );
camera.position.z = 5;
camera.position.y = 1;

function animate() {
	cube.position.x+=0.0001;
	//cube.rotation.x += 0.01;
	//cube.rotation.y += 0.01;
	//cube.rotation.z += 0.01;
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
    var keyCode = event.which;
    if (keyCode == 87) {
        cube.position.y += ySpeed;
    } else if (keyCode == 83) {
        cube.position.y -= ySpeed;
    } else if (keyCode == 65) {
        cube.position.x -= xSpeed;
    } else if (keyCode == 68) {
        cube.position.x += xSpeed;
    } else if (keyCode == 32) {
        cube.position.set(0, 0, 0);
    }
};

var xSpeed = 0.1;
var ySpeed = 0.1;
animate();