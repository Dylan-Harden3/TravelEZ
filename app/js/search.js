// Get all of the search icons 
var icons = document.getElementsByClassName('icon');

// set onclick of every icon to selectIcon
for(var i = 0 ; i < icons.length ; i++){
    icons[i].onclick = selectIcon;
}

// change the icons
function selectIcon() {
    // when an icon is clicked, first we set the local storage to reflect the change
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
    // now we change which icon has an outline, and change the search bar to the new search
    toggleOutline(this);
    setSearchBar(this);
}

// set the icon which is selected
function toggleOutline(icon) {
    // iterate all the icons and if the icon is the one which was selected add an outline
    for(var i = 0 ; i < icons.length ; i++){
        if(icons[i].id != icon.id){
            icons[i].classList.remove('outline-red');
            if(icons[i].previousElementSibling){
                icons[i].previousElementSibling.classList.remove('font-weight-bold');
            }
        }else {
            icons[i].classList.add('outline-red')
            if(icons[i].previousElementSibling){
                icons[i].previousElementSibling.classList.add('font-weight-bold');
            }
            
            if(window.location.href.split('/').at(-1) == 'result.html?'){
                document.getElementById('search-description').textContent = `${icons[i].id} search`;
            }
        }
    }
        var roundTrip = document.getElementById('round-trip');
        if(localStorage.getItem('flight-selected') == 'true'){
            roundTrip.style.display = 'block';
        }else {
            roundTrip.style.display = 'none';
        }
}

// change the search bar
function setSearchBar(icon) {
    var realId = `${icon.id}-search`;

    // we get all selected elements, and make them not selected (display: none)
    var selected = document.getElementsByClassName('selected');
    selected[0].classList.add('not-selected');
    selected[0].classList.remove('selected');

    // now we get the new search bar and takeaway the not selected class
    var newSelected = document.getElementById(realId);
    newSelected.classList.add('selected');
    newSelected.classList.remove('not-selected');
}

// each time the window is loaded we set the search to location by default
window.onload = () => {
    var locationSelected = localStorage.getItem('location-selected');
    var hotelSelected = localStorage.getItem('hotel-selected');
    var flightSelected = localStorage.getItem('flight-selected');
    if(!hotelSelected || locationSelected || flightSelected){
        localStorage.setItem('location-selected','true');
        localStorage.setItem('hotel-selected','false');
        localStorage.setItem('flight-selected','false');
    }
        document.getElementById('round-trip').style.display = 'none';
}

// get all the input forms and add setSearch onclick
var searchBars = document.getElementsByClassName('input-group');

for(var i = 0 ; i < searchBars.length ; i++) { 
    searchBars[i].onclick = setSearch;
}

async function setSearch() {
    // get the search value and set the locale storage to reflect
    var searchFields = document.getElementsByClassName('txt');
    var search = "";
    var locationSeach = localStorage.getItem('location-selected');
    var flightSelected = localStorage.getItem('flight-selected');
    // iterate all search fields, if the search field was selected then we use its content
    for(var i = 0 ; i < searchFields.length ; i++) {
        if(searchFields[i].parentElement.classList.contains('selected')){
            if(i == searchFields.length-1) {
                search += searchFields[i].value;
            }else {
                if(locationSeach == 'true'){
                    search += searchFields[i].value;
                }else {
                    search += searchFields[i].value + ",";
                }
            }
        }
    }
    if(localStorage.getItem('hotel-selected') == 'true' || localStorage.getItem('roundTrip') == 'false'){
        search = search.substr(0,search.length-1);
    }
    // now we set the search in local storage so we can access it when loading the results page
    localStorage.setItem('lastSearch',localStorage.getItem('search'));
    localStorage.setItem('search',search);
}

function toggleRoundTrip() {
    if(document.getElementById('roundTripSelector').checked){
        document.getElementById('roundTripInput').style.display = 'block';
        localStorage.setItem('roundTrip','true');
    }else {
        document.getElementById('roundTripInput').style.display = 'none';
        localStorage.setItem('roundTrip','false');
    }
}