import * as THREE from 'three';	
import * as CANNON from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {GUI} from 'dat.gui';

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

const light = new THREE.AmbientLight( 0xffffff ); // soft white light
scene.add( light );

//const backgroundtexture = new THREE.TextureLoader().load("");
//scene.background = backgroundtexture;

const gridHelper = new THREE.GridHelper(200,50);
scene.add(gridHelper);

/// CANNON
const physicsWorld = new CANNON.World({
    gravity: new CANNON.Vec3(0, 0, 0 ),
});

// Creating objects

let Atom_Arrayt=[];
let Atom_Arrayc=[];
let Atom_center=[];

const box_geometry = new THREE.BoxGeometry(1,1,1);
const box_material = new THREE.MeshNormalMaterial({color:0x0000ff});
const box = new THREE.Mesh(box_geometry,box_material); scene.add(box);
const BoxBody = new CANNON.Body({
    mass: 5,
    shape:new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)),
});
BoxBody.position.set(0,3,0);
physicsWorld.addBody(BoxBody);

const torus_geometry = new THREE.TorusGeometry( 10, 3, 16, 64 ); 
const torus_material = new THREE.MeshStandardMaterial( { color: 0xffffff, wireframe:true } ); 
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

function rand_vec(low, high) {
    return new CANNON.Vec3(
        Math.random() * (high - low) + low,
        Math.random() * (high - low) + low,
        Math.random() * (high - low) + low
    );
}
/// ATOM GENERATION SETUP
const atom_geom = new THREE.TetrahedronGeometry(0.1, 1);
const atom_mat = new THREE.MeshBasicMaterial({color: 0xff0000});

function addAtom(){
    // Math stuff for random generation
    const angle = Math.random() * Math.PI * 2;
    const angle1 = Math.random() * Math.PI * 2;
    const radius1 = 0 + Math.random() * 2.7;
    const x = Math.cos(angle) * (10 - radius1 * Math.cos(angle1));
    const z = Math.sin(angle) * (10 - radius1 * Math.cos(angle1));
    const y = Math.sin(angle1) * radius1;
    /// THREE
    const atomt = new THREE.Mesh(atom_geom, atom_mat);
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
        velocity: new CANNON.Vec3(Math.random()*0.2 - 0.1,Math.random()*0.2 - 0.1, Math.random()*0.2 - 0.1)
    });
    physicsWorld.addBody(atomc);

    Atom_center.push([
        atomc.position.clone().vadd(rand_vec(-0.1, 0.1)),
        atomc.position.clone().vadd(rand_vec(-0.1, 0.1))
    ]);

    Atom_Arrayt.push(atomt);
    Atom_Arrayc.push(atomc);
}

// SETTING UP SOME STUFF

var controls_gui = new function() {
    this.vibration_scale = 0.1;
}

var controls1_gui = {
    AddAtoms: function(){
        Array(1).fill().forEach(addAtom);
    }
}

camera.position.set( 0, 10 , 20);
camera.lookAt( 0, 0, 0 );


Array(700).fill().forEach(addAtom);

function MakeLight(objectpozx,objectpozy,objectpozz)
{
    const light = new THREE.PointLight( 0xff0000, 1, 100 );
    light.position.x = objectpozx;
    light.position.y = objectpozy;
    light.position.z = objectpozz;
    const spotLightHelper = new THREE.SpotLightHelper( light );
    scene.add( spotLightHelper );
    scene.add(light);
}

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

    ///MAKE ROTATE THEN REALISE TOKAMAK NO ROTATE AND THEN I WANT KMS
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
        let a=new CANNON.Vec3(0, 0, 0);
        for (let j = 0; j < Atom_center[i].length; j++)
            a = a.vadd(Atom_center[i][j].vsub(Atom_Arrayc[i].position));
        a = a.scale(controls_gui.vibration_scale);
        Atom_Arrayc[i].applyForce(a);
        Atom_Arrayt[i].position.copy(Atom_Arrayc[i].position);
        Atom_Arrayt[i].quaternion.copy(Atom_Arrayc[i].quaternion);
    }
    
    /*for(var i=0;i<Atom_Arrayc.length;i++)
    {
        for(var j=0;j<Atom_Arrayc.length;j++)
        {
            if( i!=j)
            {
                const t1 = (Atom_Arrayc[i].position.x-Atom_Arrayc[j].position.x)*(Atom_Arrayc[i].position.x-Atom_Arrayc[j].position.x);
                const t2 = (Atom_Arrayc[i].position.y-Atom_Arrayc[j].position.y)*(Atom_Arrayc[i].position.y-Atom_Arrayc[j].position.y);
                const t3 = (Atom_Arrayc[i].position.z-Atom_Arrayc[j].position.z)*(Atom_Arrayc[i].position.z-Atom_Arrayc[j].position.z);
                const dist = Math.sqrt(t1 + t2 + t3);
                if(dist <=0.1)
                {
                    MakeLight(Atom_Arrayc[i].position.x,Atom_Arrayc[i].position.y,Atom_Arrayc[i].position.z);
                }
            }
        }
    }*/
    box.position.copy(BoxBody.position);
    box.quaternion.copy(BoxBody.quaternion);
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

/// LIL GUI
const gui = new GUI();

var controls1_gui = {
    AddAtoms_1: function(){
        Array(1).fill().forEach(addAtom);
    }
}
var controls2_gui = {
    AddAtoms_10: function(){
        Array(10).fill().forEach(addAtom);
    }
}
var controls3_gui = {
    AddAtoms_50: function(){
        Array(50).fill().forEach(addAtom);
    }
}
var controls4_gui = {
    AddAtoms_100: function(){
        Array(1).fill().forEach(addAtom);
    }
}

gui.add(controls1_gui, 'AddAtoms_1').name("Add Atoms(1)");
gui.add(controls2_gui, 'AddAtoms_10').name("Add Atoms(10)");
gui.add(controls3_gui, 'AddAtoms_50').name("Add Atoms(50)");
gui.add(controls4_gui, 'AddAtoms_100').name("Add Atoms(100)");
gui.add(controls_gui, 'vibration_scale', 0.1 ,100).name("Temperature");

const materialParams = {
    torusMeshColor : torus.material.color.getHex(),
};
gui.add(torus.material, 'wireframe');
gui.addColor(materialParams, 'torusMeshColor')
   .onChange((value) => torus.material.color.set(value));

// testing