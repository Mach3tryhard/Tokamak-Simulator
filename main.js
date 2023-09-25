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
let Atoms = [];

const box_geometry = new THREE.BoxGeometry(0.25,0.25,0.25);
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
var i=0;
const atom_geom = new THREE.TetrahedronGeometry(0.1, 1);
const atom_deut_mat = new THREE.MeshBasicMaterial({color: 0xff0000});
const atom_trit_mat = new THREE.MeshBasicMaterial({color: 0xffa500});
const atom_heli_mat = new THREE.MeshBasicMaterial({color: 0x967bb6});

function addAtom(){
    // Math stuff for random generation
    const angle = Math.random() * Math.PI * 2;
    const angle1 = Math.random() * Math.PI * 2;
    const radius1 = 0 + Math.random() * 2.7;
    const x = Math.cos(angle) * (10 - radius1 * Math.cos(angle1));
    const z = Math.sin(angle) * (10 - radius1 * Math.cos(angle1));
    const y = Math.sin(angle1) * radius1;
    /// THREE
    const color = new THREE.Color(0xff00000);
    const color1 = new THREE.Color(0xffa500);
    let atomt;
    if(i%2==0){
        atomt = new THREE.Mesh(atom_geom, atom_trit_mat);
    }
    else{
        atomt = new THREE.Mesh(atom_geom, atom_deut_mat);
    }
    i=i+1;
    atomt.position.set(x,y,z);   
    scene.add(atomt); 
    /// CANNON
    let atom = {};
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

    atom.t = atomt;
    atom.c = atomc;
    atom.center = [
        atomc.position.clone().vadd(rand_vec(-0.1, 0.1)),
        atomc.position.clone().vadd(rand_vec(-0.1, 0.1)),
        atomc.position.clone().vadd(rand_vec(-0.1, 0.1))
    ];
    atomc.ref = atom;
    atom.paplito = true;
    atom.remain = true;
    Atoms.push(atom);
}

// SETTING UP SOME STUFF

var controls_gui = new function() {
    this.vibration_scale = 0.1;
}

camera.position.set( 0, 4 , 20);
camera.lookAt( 0, 4, 0 );


Array(1000).fill().forEach(addAtom);

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

function acollision (event){
    let a = event.bodyA;
    let b = event.bodyB;
    if(a.ref.paplito==true && b.ref.paplito==true)
    {
        a.ref.remain = false;
        scene.remove(b.ref.t);
        b.ref.t = new THREE.Mesh(atom_geom, atom_heli_mat);
        scene.add(b.ref.t); 
        scene.remove( a.ref.t );
        b.ref.paplito=false;
    }
};
physicsWorld.addEventListener('beginShapeContact', acollision);

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

    ///Rotation Code
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
    for(var i=0;i<Atoms.length;i++)
    {
        while (Atoms[i].remain == false) {
            physicsWorld.removeBody(Atoms[i].c);
            Atoms.splice(i, 1);
        }
        let a=new CANNON.Vec3(0, 0, 0);
        for (let j = 0; j < Atoms[i].center.length; j++)
            a = a.vadd(Atoms[i].center[j].vsub(Atoms[i].c.position));
        a = a.scale(controls_gui.vibration_scale);
        Atoms[i].c.applyForce(a);
        Atoms[i].t.position.copy(Atoms[i].c.position);
        Atoms[i].t.quaternion.copy(Atoms[i].c.quaternion);
    }
    box.position.copy(BoxBody.position);
    box.quaternion.copy(BoxBody.quaternion);
};
animate_physics();

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
    AddAtoms_2: function(){
        Array(2).fill().forEach(addAtom);
    },
    AddAtoms_4: function(){
        Array(4).fill().forEach(addAtom);
    },
    AddAtoms_8: function(){
        Array(8).fill().forEach(addAtom);
    },
    AddAtoms_16: function(){
        Array(16).fill().forEach(addAtom);
    },
    AddAtoms_32: function(){
        Array(32).fill().forEach(addAtom);
    },
    AddAtoms_64: function(){
        Array(64).fill().forEach(addAtom);
    },
    AddAtoms_86: function(){
        Array(86).fill().forEach(addAtom);
    }
}

var remove1_gui = {
    Remove_all: function(){
        var numerouno=0;
        for(var i=0;i<Atoms.length;i++)
        {
            if(Atoms[i].paplito==false)
            {
                scene.remove(Atoms[i].t);
                physicsWorld.removeBody(Atoms[i].c);
                numerouno++;
                Atoms.splice(i,1);
            }
        }
    },
    Remove_2: function(){
        var numerouno=0;
        for(var i=0;i<Atoms.length;i++)
        {
            if(Atoms[i].paplito==false)
            {
                scene.remove(Atoms[i].t);
                physicsWorld.removeBody(Atoms[i].c);
                numerouno++;
                Atoms.splice(i,1);
            }
            if(numerouno==2)
            {
                break;
            }
        }
    },
    Remove_4: function(){
        var numerouno=0;
        for(var i=0;i<Atoms.length;i++)
        {
            if(Atoms[i].paplito==false)
            {
                scene.remove(Atoms[i].t);
                physicsWorld.removeBody(Atoms[i].c);
                numerouno++;
                Atoms.splice(i,1);
            }
            if(numerouno==4)
            {
                break;
            }
        }
    },
    Remove_8: function(){
        var numerouno=0;
        for(var i=0;i<Atoms.length;i++)
        {
            if(Atoms[i].paplito==false)
            {
                scene.remove(Atoms[i].t);
                physicsWorld.removeBody(Atoms[i].c);
                numerouno++;
                Atoms.splice(i,1);
            }
            if(numerouno==8)
            {
                break;
            }
        }
    },
    Remove_16: function(){
        var numerouno=0;
        for(var i=0;i<Atoms.length;i++)
        {
            if(Atoms[i].paplito==false)
            {
                scene.remove(Atoms[i].t);
                physicsWorld.removeBody(Atoms[i].c);
                numerouno++;
                Atoms.splice(i,1);
            }
            if(numerouno==16)
            {
                break;
            }
        }
    },
    Remove_32: function(){
        var numerouno=0;
        for(var i=0;i<Atoms.length;i++)
        {
            if(Atoms[i].paplito==false)
            {
                scene.remove(Atoms[i].t);
                physicsWorld.removeBody(Atoms[i].c);
                numerouno++;
                Atoms.splice(i,1);
            }
            if(numerouno==32)
            {
                break;
            }
        }
    },
    Remove_64: function(){
        var numerouno=0;
        for(var i=0;i<Atoms.length;i++)
        {
            if(Atoms[i].paplito==false)
            {
                scene.remove(Atoms[i].t);
                physicsWorld.removeBody(Atoms[i].c);
                numerouno++;
                Atoms.splice(i,1);
            }
            if(numerouno==64)
            {
                break;
            }
        }
    },
    Remove_86: function(){
        var numerouno=0;
        for(var i=0;i<Atoms.length;i++)
        {
            if(Atoms[i].paplito==false)
            {
                scene.remove(Atoms[i].t);
                physicsWorld.removeBody(Atoms[i].c);
                numerouno++;
                Atoms.splice(i,1);
            }
            if(numerouno==86)
            {
                break;
            }
        }
    },
}

const FuelControl = gui.addFolder("Fuel Control");
FuelControl.open();

const AddHydrogen = FuelControl.addFolder("Add Hydrogen");
AddHydrogen.add(controls1_gui, 'AddAtoms_2').name("Add 2 Atoms(1-Deuterium 1-Tritium)");
AddHydrogen.add(controls1_gui, 'AddAtoms_4').name("Add 4 Atoms(2-Deuterium 2-Tritium)");
AddHydrogen.add(controls1_gui, 'AddAtoms_8').name("Add 8 Atoms(4-Deuterium 4-Tritium)");
AddHydrogen.add(controls1_gui, 'AddAtoms_16').name("Add 16 Atoms(8-Deuterium 8-Tritium)");
AddHydrogen.add(controls1_gui, 'AddAtoms_32').name("Add 32 Atoms(16-Deuterium 16-Tritium)");
AddHydrogen.add(controls1_gui, 'AddAtoms_64').name("Add 64 Atoms(32-Deuterium 32-Tritium)");
AddHydrogen.add(controls1_gui, 'AddAtoms_86').name("Add 86 Atoms(43-Deuterium 43-Tritium)");
AddHydrogen.open();

const RemoveHelium = FuelControl.addFolder("Remove Helium");
RemoveHelium.add(remove1_gui, 'Remove_all').name("Remove all Helium atoms");
RemoveHelium.add(remove1_gui, 'Remove_2').name("Remove 2 Helium atoms");
RemoveHelium.add(remove1_gui, 'Remove_4').name("Remove 4 Helium atoms");
RemoveHelium.add(remove1_gui, 'Remove_8').name("Remove 8 Helium atoms");
RemoveHelium.add(remove1_gui, 'Remove_16').name("Remove 16 Helium atoms");
RemoveHelium.add(remove1_gui, 'Remove_32').name("Remove 32 Helium atoms");
RemoveHelium.add(remove1_gui, 'Remove_64').name("Remove 64 Helium atoms");
RemoveHelium.add(remove1_gui, 'Remove_86').name("Remove 86 Helium atoms");
RemoveHelium.open();

const FusionFactors = gui.addFolder("Fusion Factors");
FusionFactors.open();
FusionFactors.add(controls_gui, 'vibration_scale', 0.1 ,100).name("Temperature");

const Visibility = gui.addFolder("Visibility Control");
Visibility.open();
const materialParams = {
    torusMeshColor : torus.material.color.getHex(),
};
Visibility.add(torus.material, 'wireframe');
Visibility.addColor(materialParams, 'torusMeshColor')
   .onChange((value) => torus.material.color.set(value));
