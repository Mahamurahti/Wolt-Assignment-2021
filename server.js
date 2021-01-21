const express = require('express');
const url = require('url');

const app = express();
app.use(express.static(__dirname + '/public'));

let restaurants = require("./restaraunts.json");

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/discovery', function (req, res) {
    const q = url.parse(req.url, true).query;
    const userLat = q.latitude;
    const userLon = q.longitude;

    let popular = populatePopular(userLat, userLon);
    let newest = populateNewest(userLat, userLon);
    let nearby = populateNearby(userLat, userLon);

    let result = {
        sections: [
            {
                title: 'Popular Restaurants',
                restaurants: popular
            },
            {
                title: 'New Restaurants',
                restaurants: newest
            },
            {
                title: 'Nearby Restaurants',
                restaurants: nearby
            }
        ]
    }

    res.send(result)
})

let populatePopular = (userLat, userLon) => {

    // Sort the json to popularity order (highest first)
    restaurants.restaurants.sort((a, b) => a.popularity - b.popularity).reverse()

    // Populate the array
    let array = populateArray(userLat, userLon, false)

    // Slice the array to include only the 10 best matches
    array.length = 10;

    // Filter the array to exclude null values
    array = filterNull(array);

    return array;
}

let populateNewest = (userLat, userLon) => {

    // Sort the json to launch_date order (newest first)
    restaurants.restaurants.sort((a, b) => new Date(a.launch_date) - new Date(b.launch_date)).reverse()

    // Populate the array with the special rule
    let array = populateArray(userLat, userLon, true);

    // Slice the array to include only the 10 best matches
    array.length = 10;

    // Filter the array to exclude null values
    array = filterNull(array);

    return array;
}

let populateNearby = (userLat, userLon) => {

    // Create a temporary property of distance for the sorting
    restaurants.restaurants.forEach(element => element.distance = distanceCoordToKm(userLat, userLon, element.location[1], element.location[0]))

    // Sort the json to distance order (closest first)
    restaurants.restaurants.sort((a, b) => a.distance - b.distance)

    // Delete the temporary property
    restaurants.restaurants.forEach(element => delete element.distance)

    // Populate the array
    let array = populateArray(userLat, userLon, false);

    // Slice the array to include only the 10 best matches
    array.length = 10;

    // Filter the array to exclude null values
    array = filterNull(array);

    return array;
}

// Populate an array with restaurants close to the user.
// Special rule is for the "Newest Restaurants" array since the restaurants can't be older than 4 months
let populateArray = (userLat, userLon, specialRule) => {

    let array = [];

    // Populate the array with restaurants with distance lower than 1.5km and online = true
    restaurants.restaurants.forEach(element => {
        let distance = distanceCoordToKm(userLat, userLon, element.location[1], element.location[0]);
        if(specialRule){
            let today = dateMinusFourMonths();
            if(distance <= 1.5 && element.online && new Date(element.launch_date) >= today){ array.push(element) }
        }else{
            if(distance <= 1.5 && element.online){ array.push(element) }
        }
    })

    // Populate the rest of the array with restaurants with distance lower than 1.5km and online = false
    restaurants.restaurants.forEach(element => {
        let distance = distanceCoordToKm(userLat, userLon, element.location[1], element.location[0]);
        if(specialRule){
            let today = dateMinusFourMonths();
            if(distance <= 1.5 && !element.online && new Date(element.launch_date) >= today){ array.push(element) }
        }else{
            if(distance <= 1.5 && !element.online){ array.push(element) }
        }
    })

    return array;
}

// Get today's date minus 4 months (month can have 31 / 30 days, but implement that kind of logic takes time)
let dateMinusFourMonths = () => {

    let today = new Date();
    today.setMonth(today.getMonth() - 4);
    today.toISOString().slice(0,10);

    return today;
}

// Filters any null out of the array
let filterNull = (array) => {
    return array.filter(element => element !== null)
}

// Convert map coordinates into radians and calculate distance between the two coordinate points in km (Haversine Formula)
let distanceCoordToKm = (lat1, lon1, lat2, lon2) => {

    let earthRadius = 6371;

    let distLat = deg2rad(lat2 - lat1);
    let distLon = deg2rad(lon2 - lon1);

    let calc = Math.sin(distLat / 2) * Math.sin(distLat / 2) +
               Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
               Math.sin(distLon / 2) * Math.sin(distLon / 2);
    let inverse = 2 * Math.atan2(Math.sqrt(calc), Math.sqrt(1 - calc));

    return earthRadius * inverse;
}

// Convert degrees to radians
let deg2rad = (deg) => {
    return deg * (Math.PI / 180)
}

const server = app.listen(8081, function () {
    let port = server.address().port;

    console.log("Wolt discovery app listening at http://localhost:%s", port);
});