(() => {
  'use strict';
  const locations = {
    'Riverside Park': {x:126,y:112}, 'Old Town Market': {x:411,y:407},
    'Northstar Station': {x:568,y:172}, 'Sunset Beach': {x:174,y:423},
    'Garden District': {x:396,y:91}
  };
  const state = {currentStage:0,pickupLocation:'Riverside Park',destinationLocation:'Old Town Market',selectedVehicle:'car',journeyProgress:0,passengerOnboard:false,journeyCompleted:false,journeyStarted:false,route:null,raf:0,scrollScrub:false};
  const $ = s => document.querySelector(s);
  const pickupInput=$('#pickup'),destinationInput=$('#destination'),form=$('#booking-form'),error=$('#form-error');
  const vehicle=$('#vehicle'),inner=$('.vehicle-inner'),pickupMarker=$('#pickup-marker'),destinationMarker=$('#destination-marker'),passenger=$('#passenger'),arrivalBurst=$('#arrival-burst');
  const routeBase=$('#route-base'),routeShadow=$('#route-shadow'),routeProgress=$('#route-progress'),map=$('#city-map'),status=$('#scene-status');
  const story=[...document.querySelectorAll('.story-step')];
  const point=(x,y)=>`${x} ${y}`;
  function initializeMap(){
    drawRoute();
    updateMarkers();
    const vb=map.viewBox.baseVal; // keep the scene usable when system motion is reduced
    map.dataset.aspect=`${vb.width}/${vb.height}`;
  }
  function selectPickupLocation(value){state.pickupLocation=value;drawRoute();updateMarkers()}
  function selectDestination(value){state.destinationLocation=value;drawRoute();updateMarkers()}
  function drawRoute(){
    const a=locations[state.pickupLocation],b=locations[state.destinationLocation];
    if(!a||!b)return;
    const midX=(a.x+b.x)/2,midY=(a.y+b.y)/2;
    const bendX=Math.max(95,Math.min(615,midX+(b.y-a.y)*.22));
    const bendY=Math.max(72,Math.min(482,midY-(b.x-a.x)*.16));
    const start={x:Math.max(38,a.x-80),y:Math.max(45,a.y-54)};
    const d=`M ${point(start.x,start.y)} C ${point(start.x+65,start.y-36)}, ${point(a.x-55,a.y-55)}, ${point(a.x,a.y)} S ${point(bendX,bendY)}, ${point(b.x,b.y)}`;
    [routeBase,routeShadow,routeProgress].forEach(p=>p.setAttribute('d',d));
    state.route=routeProgress;
    const length=routeProgress.getTotalLength();
    routeProgress.style.strokeDasharray=length;
    routeProgress.style.strokeDashoffset=length*(1-state.journeyProgress);
    state.routeLength=length;state.startPoint=start;
    if(!state.journeyStarted)placeVehicle(0);
  }
  function updateMarkers(){
    const a=locations[state.pickupLocation],b=locations[state.destinationLocation];
    if(a){pickupMarker.classList.remove('hidden');pickupMarker.setAttribute('transform',`translate(${a.x} ${a.y})`)}
    if(b){destinationMarker.classList.remove('hidden');destinationMarker.setAttribute('transform',`translate(${b.x} ${b.y})`)}
  }
  function placeVehicle(progress){
    if(!state.route)return;
    const length=state.routeLength,p=state.route.getPointAtLength(Math.max(0,Math.min(1,progress))*length);
    const ahead=state.route.getPointAtLength(Math.min(length,Math.max(0,Math.min(1,progress))*length+2));
    const angle=Math.atan2(ahead.y-p.y,ahead.x-p.x)*180/Math.PI;
    vehicle.setAttribute('transform',`translate(${p.x} ${p.y}) rotate(${angle})`);
    vehicle.classList.add('visible');
    routeProgress.style.strokeDashoffset=length*(1-progress);
    const wheels=vehicle.querySelectorAll('.wheel');
    wheels.forEach(w=>w.style.transform=`rotate(${progress*3200}deg)`);
    inner.dataset.kind=state.selectedVehicle;
    if(state.selectedVehicle==='bike'){
      vehicle.querySelector('.car-body').setAttribute('d','M-31 6h10l12-4 10-10h11l6 8h9v10h-58z');
    }else if(state.selectedVehicle==='auto'){
      vehicle.querySelector('.car-body').setAttribute('d','M-32 4h5l5-17h43l9 18h5q4 1 4 5v11h-74V8q0-4 3-4z');
    }else{
      vehicle.querySelector('.car-body').setAttribute('d','M-31 5h5l7-15q3-6 10-6h17q7 0 11 7l7 14h5q5 1 5 6v10h-72V9q0-4 5-4z');
    }
  }
  function setStage(stage){
    state.currentStage=Math.max(0,Math.min(4,stage));
    story.forEach((s,i)=>s.classList.toggle('active',i===state.currentStage));
    const labels=['Waiting for your route','Driver approaching pickup','Your passenger is aboard','On the way to your destination','You have arrived'];
    status.textContent=labels[state.currentStage];
  }
  function handlePassengerPickup(){
    state.passengerOnboard=true;
    const p=locations[state.pickupLocation];passenger.classList.remove('hidden');
    passenger.setAttribute('transform',`translate(${p.x-27} ${p.y-4})`);
    passenger.animate([{transform:`translate(${p.x-27}px,${p.y-4}px)`},{transform:`translate(${p.x}px,${p.y-4}px)`}],{duration:1000,easing:'ease-in-out',fill:'forwards'});
    window.setTimeout(()=>{passenger.classList.add('hidden');setStage(3)},1200);
  }
  function handleDestinationArrival(){
    state.journeyCompleted=true;state.journeyStarted=false;placeVehicle(1);setStage(4);
    const p=locations[state.destinationLocation];arrivalBurst.classList.remove('hidden');arrivalBurst.setAttribute('transform',`translate(${p.x} ${p.y-38})`);
    setTimeout(()=>arrivalBurst.classList.add('hidden'),2200);
    error.textContent=`Journey complete · ${state.pickupLocation} to ${state.destinationLocation}.`;
    error.style.color='#347453';
  }
  function animateVehicle(){
    cancelAnimationFrame(state.raf);
    const duration=9000,start=performance.now(),pickupRatio=.31;
    state.journeyStarted=true;state.journeyCompleted=false;state.passengerOnboard=false;
    arrivalBurst.classList.add('hidden');passenger.classList.add('hidden');error.textContent='';error.style.color='';
    vehicle.classList.add('visible');setStage(1);
    function frame(now){
      const elapsed=now-start;
      if(elapsed<duration*pickupRatio){
        let t=elapsed/(duration*pickupRatio);t=t*t*(3-2*t);state.journeyProgress=t*pickupRatio;placeVehicle(state.journeyProgress);state.raf=requestAnimationFrame(frame);
      }else if(elapsed<duration*pickupRatio+1100){
        if(state.currentStage!==2){state.journeyProgress=pickupRatio;placeVehicle(pickupRatio);setStage(2);handlePassengerPickup()}
        state.raf=requestAnimationFrame(frame);
      }else{
        setStage(3);let t=(elapsed-duration*pickupRatio-1100)/(duration*(1-pickupRatio)-1100);t=Math.min(1,Math.max(0,t));t=t*t*(3-2*t);
        state.journeyProgress=pickupRatio+t*(1-pickupRatio);placeVehicle(state.journeyProgress);
        if(t<1)state.raf=requestAnimationFrame(frame);else handleDestinationArrival();
      }
    }
    state.raf=requestAnimationFrame(frame);
  }
  function startJourney(){
    const a=pickupInput.value.trim(),b=destinationInput.value.trim();
    if(!locations[a]||!locations[b]){error.style.color='';error.textContent='Choose a demo location from the suggestions for both fields.';return false}
    if(a===b){error.style.color='';error.textContent='Choose two different places for your journey.';return false}
    state.pickupLocation=a;state.destinationLocation=b;drawRoute();updateMarkers();state.journeyProgress=0;setStage(1);animateVehicle();
    document.querySelector('#how-it-works').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    return true;
  }
  function resetJourney(){
    cancelAnimationFrame(state.raf);state.raf=0;state.journeyStarted=false;state.journeyCompleted=false;state.passengerOnboard=false;state.journeyProgress=0;
    pickupInput.value='Riverside Park';destinationInput.value='Old Town Market';state.pickupLocation=pickupInput.value;state.destinationLocation=destinationInput.value;
    passenger.classList.add('hidden');arrivalBurst.classList.add('hidden');error.textContent='';error.style.color='';vehicle.classList.remove('visible');
    drawRoute();updateMarkers();setStage(0);
  }
  function updateScrollProgress(){
    // Scrolling the story provides a reversible preview; a running ride remains time-based.
    if(state.journeyStarted)return;
    const top=document.querySelector('.journey').getBoundingClientRect().top;
    const span=document.querySelector('.journey').offsetHeight-window.innerHeight;
    if(span<=0)return;
    const progress=Math.max(0,Math.min(1,-top/span));
    if(progress>0){state.journeyProgress=progress;placeVehicle(progress);setStage(Math.min(4,Math.floor(progress*5)))}
  }
  form.addEventListener('submit',e=>{e.preventDefault();startJourney()});
  $('#swap-locations').addEventListener('click',()=>{[pickupInput.value,destinationInput.value]=[destinationInput.value,pickupInput.value];selectPickupLocation(pickupInput.value);selectDestination(destinationInput.value);error.textContent=''});
  $('#reset-journey').addEventListener('click',resetJourney);
  pickupInput.addEventListener('change',()=>selectPickupLocation(pickupInput.value.trim()));
  destinationInput.addEventListener('change',()=>selectDestination(destinationInput.value.trim()));
  document.querySelectorAll('.ride-card').forEach(card=>card.addEventListener('click',()=>{
    document.querySelectorAll('.ride-card').forEach(c=>{c.classList.remove('selected');c.setAttribute('aria-checked','false')});
    card.classList.add('selected');card.setAttribute('aria-checked','true');state.selectedVehicle=card.dataset.ride;placeVehicle(state.journeyProgress);
  }));
  let scrollFrame=0;window.addEventListener('scroll',()=>{if(scrollFrame)return;scrollFrame=requestAnimationFrame(()=>{scrollFrame=0;updateScrollProgress()})},{passive:true});
  initializeMap();
})();
