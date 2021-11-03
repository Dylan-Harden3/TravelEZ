
window.onload = () => {
    console.log(`location-selected ${localStorage.getItem('location-selected')}`);
    console.log(`hotel-selected ${localStorage.getItem('hotel-selected')}`);
    console.log(`flight-selected ${localStorage.getItem('flight-selected')}`);
    console.log(`search: ${localStorage.getItem('search')}`)
    search(localStorage.getItem('search'));
}

async function search(text)  {
    const response = await fetch(`../../getweather/${text}`);
    const json = await response.json();
    console.log(json);
}