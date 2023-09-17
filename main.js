import * as THREE from 'three';	
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls( camera, renderer.domElement );

const gridHelper = new THREE.GridHelper(200,50);
scene.add(gridHelper);

const backgroundtexture = new THREE.TextureLoader().load("");
//scene.background = backgroundtexture;

// Creating objects

const torus_geometry = new THREE.TorusGeometry( 10, 3, 16, 64 ); 
const torus_material = new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe:true } ); 
const torus = new THREE.Mesh( torus_geometry, torus_material ); scene.add( torus );

const geometry = new THREE.IcosahedronGeometry(1,0);
const material = new THREE.MeshBasicMaterial( { color: 0xF8C8DC } );
const Object = new THREE.Mesh( geometry, material ); scene.add( Object );

function addAtom(){
    const geometry = new THREE.SphereGeometry(0.1,24,24);
    const material = new THREE.MeshBasicMaterial({color:0x800080})
    const atom = new THREE.Mesh(geometry,material);

    const angle = Math.random() * Math.PI * 2;
    const radius = 8 + Math.random() * 5;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    atom.position.set(x,0,z);   

    scene.add(atom);
}
// Objects setup

torus.rotateX(-1.57079633);

camera.position.set( 0, 0, 16);
camera.lookAt( 0, 0, 0 );

Array(500).fill().forEach(addAtom);

//Continous Animations

function animate() {
    controls.update();  
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
// Moving Functions

var zspeed = 0.1;
var xSpeed = 0.1;
var ySpeed = 0.1;
document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
    var keyCode = event.which;
    if (keyCode == 81) {
        Object.position.z +=zspeed;
    } else if (keyCode == 69) {
        Object.position.z -= zspeed;
    } else if (keyCode == 87) {
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
animate();

// Resize window functions

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

// testing

