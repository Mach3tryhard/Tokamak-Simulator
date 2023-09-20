import * as THREE from 'three';	
import * as CANNON from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/// Scene preparation

///STATS 
(function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='https://mrdoob.github.io/stats.js/build/stats.min.js';document.head.appendChild(script);})()

/// THREE
const scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls( camera, renderer.domElement );

//const backgroundtexture = new THREE.TextureLoader().load("");
//scene.background = backgroundtexture;

const gridHelper = new THREE.GridHelper(200,50);
scene.add(gridHelper);

/// CANNON
const physicsWorld = new CANNON.World({
    gravity: new CANNON.Vec3(0, 0, 0 ),
});
const groundBody = new CANNON.Body({
    type: CANNON.Body.STATIC,
    shape: new CANNON.Plane(),
});
groundBody.quaternion.setFromEuler(-Math.PI/2,0,0);
//physicsWorld.addBody(groundBody);

// Creating objects

let Atom_Arrayt=[];
let Atom_Arrayc=[];


const sphere_geometry = new THREE.SphereGeometry(1);
const sphere_material = new THREE.MeshBasicMaterial({color:0x0000ff});
const sphere = new THREE.Mesh(sphere_geometry,sphere_material); scene.add(sphere);
const radius = 1;
const sphereBody = new CANNON.Body({
    mass: 5,
    shape: new CANNON.Sphere(radius),
});
sphereBody.position.set(0,7,0);
physicsWorld.addBody(sphereBody);

const torus_geometry = new THREE.TorusGeometry( 10, 3, 16, 64 ); 
const torus_material = new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe:true } ); 
const torus = new THREE.Mesh( torus_geometry, torus_material ); scene.add( torus );
torus.rotateX(-1.57079633);

const shape = CANNON.Trimesh.createTorus( 10, 3, 16, 64 );
const torus_hitbox = new CANNON.Body({
    type: CANNON.Body.STATIC,
});
torus_hitbox.addShape(shape);

var axis = new CANNON.Vec3(1,0,0);
var angle = Math.PI / 2;
torus_hitbox.quaternion.setFromAxisAngle(axis, angle);
physicsWorld.addBody(torus_hitbox);

function addAtom(){
    // Math stuff for random generation
    const angle = Math.random() * Math.PI * 2;
    const angle1 = Math.random() * Math.PI * 2;
    const radius = 8 + Math.random() * 5;
    const radius1 = 0 + Math.random() * 2.8;
    const x = Math.cos(angle) * (10 - radius1 * Math.cos(angle1));
    const z = Math.sin(angle) * (10 - radius1 * Math.cos(angle1));
    const y = Math.sin(angle1) * radius1;
    /// THREE
    const geometry = new THREE.TetrahedronGeometry(0.1,1);
    const material = new THREE.MeshBasicMaterial({color:0xff0000})
    const atomt = new THREE.Mesh(geometry,material);
    atomt.position.set(x,y,z);   
    scene.add(atomt); 
    /// CANNON

    const r = new CANNON.Vec3(x, y, z);
    const rn = r.clone();
    rn.normalize();
    const atomc = new CANNON.Body({
        friction:0,
        restitution:0,
        mass: 1,
        shape:new CANNON.Cylinder(0.1, 0.1, 0.1, 12),
        position: r,
        //velocity: rn.cross(new CANNON.Vec3(0, 1, 0)).scale(Math.random() / 4 + 10)
    });
    physicsWorld.addBody(atomc);

    Atom_Arrayt.push(atomt);
    Atom_Arrayc.push(atomc);
}

// SETTING UP SOME STUFF

camera.position.set( 0, 10 , 20);
camera.lookAt( 0, 0, 0 );


Array(700).fill().forEach(addAtom);

//Continous Animations

/// THREE
function animate() {
    controls.update();  
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}

/// CANNON
//const cannonDebugger = new CannonDebugger(scene, physicsWorld,{} );
const animate_physics = ()=>{
    physicsWorld.fixedStep();
    physicsWorld.gravity = physicsWorld.gravity.scale(-1); 
    //cannonDebugger.update();
    window.requestAnimationFrame(animate_physics);

    /*for(var i=0;i<Atom_Arrayt.length;i++)
    {       
        var r= Atom_Arrayc[i].position;
        let dv = Atom_Arrayc[i].velocity;
        /// THIS DOESNT UPDATE WITH YOUR FPS NEED TO MAKE IT DYNAMIC
        dv = r.scale(dv.lengthSquared()/r.lengthSquared()/performance.now()/1000*-1);
        const impulse = dv;
        Atom_Arrayc[i].applyImpulse(impulse);
        Atom_Arrayt[i].position.copy(Atom_Arrayc[i].position);
        Atom_Arrayt[i].quaternion.copy(Atom_Arrayc[i].quaternion);
    }*/

    for(var i=0;i<Atom_Arrayt.length;i++)
    {       
        //Atom_Arrayc[i].applyImpulse(impulse);
        Atom_Arrayt[i].position.copy(Atom_Arrayc[i].position);
        Atom_Arrayt[i].quaternion.copy(Atom_Arrayc[i].quaternion);
    }
        
    sphere.position.copy(sphereBody.position);
    sphere.quaternion.copy(sphereBody.quaternion);
};
animate_physics();

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