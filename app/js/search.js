var icons = document.getElementsByClassName('icon');

for(var i = 0 ; i < icons.length ; i++){
    icons[i].onclick = selectIcon;
}

function selectIcon() {
    if(this.id == 'location'){
        localStorage.setItem('location-selected','true');
        localStorage.setItem('hotel-selected','false');
        localStorage.setItem('flight-selected','false');
    }else if(this.id == 'hotel'){
        localStorage.setItem('hotel-selected','true');
        localStorage.setItem('location-selected','false');
        localStorage.setItem('flight-selected','false');
    }else {
        localStorage.setItem('flight-selected','true')
        localStorage.setItem('location-selected','false');
        localStorage.setItem('hotel-selected','false');
    }
    toggleOutline(this);
    setSearchBar(this);
}

function toggleOutline(icon) {
    for(var i = 0 ; i < icons.length ; i++){
        if(icons[i].id != icon.id){
            icons[i].classList.remove('outline-navy');
        }else {
            icons[i].classList.add('outline-navy')
        }
    }
}

function setSearchBar(icon) {
    var realId = `${icon.id}-search`;
    var selected = document.getElementsByClassName('selected');
    selected[0].classList.add('not-selected');
    selected[0].classList.remove('selected');
    var newSelected = document.getElementById(realId);
    newSelected.classList.add('selected');
    newSelected.classList.remove('not-selected');
}

window.onload = () => {
    var locationSelected = localStorage.getItem('location-selected');
    var hotelSelected = localStorage.getItem('hotel-selected');
    var flightSelected = localStorage.getItem('flight-selected');
    if(!hotelSelected || locationSelected || flightSelected){
        localStorage.setItem('location-selected','true');
        localStorage.setItem('hotel-selected','false');
        localStorage.setItem('flight-selected','false');
    }
}

var searchBars = document.getElementsByClassName('input-group');

for(var i = 0 ; i < searchBars.length ; i++) { 
    //searchBars[i].addEventListener('submit',search);
    searchBars[i].onclick = setSearch;
}

function search(e) {
    e.preventDefault();
    console.log('submit');
}

function setSearch() {
    var search = document.getElementById('txt').value;
    localStorage.setItem('search',search)
}