import * as THREE from 'three';	
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );

// Creating objects
const torus_geometry = new THREE.TorusGeometry( 10, 3, 16, 100 ); 
const torus_material = new THREE.MeshBasicMaterial( { color: 0xffff00 } ); 
const torus = new THREE.Mesh( torus_geometry, torus_material ); scene.add( torus );

const geometry = new THREE.IcosahedronGeometry(1,0);
const material = new THREE.MeshBasicMaterial( { color: 0xF8C8DC } );
const Object = new THREE.Mesh( geometry, material ); scene.add( Object );

// Camera setup

camera.position.set( 0, 0, 100 );
camera.lookAt( 0, 0, 0 );
camera.position.z = 5;
camera.position.y = 1;

function animate() {
	//Object.rotation.x += 0.01;
	//Object.rotation.y += 0.01;
	//Object.rotation.z += 0.01;
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
    var keyCode = event.which;
    if (keyCode == 87) {
        Object.position.y += ySpeed;
    } else if (keyCode == 83) {
        Object.position.y -= ySpeed;
    } else if (keyCode == 65) {
        Object.position.x -= xSpeed;
    } else if (keyCode == 68) {
        Object.position.x += xSpeed;
    } else if (keyCode == 32) {
        Object.position.set(0, 0, 0);
    }
};

var xSpeed = 0.1;
var ySpeed = 0.1;
animate();