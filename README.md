# Wolt-Assignment-2021
 Assignment brief for junior developers 2021. Backend version.
 
 # My implementation
My goal was to make the app with Express, since that is the easiest to setup a server with.

# Overview

In 2017 we added a new view to the Wolt App, known as Discovery. The view mixes curated and automatically generated content, like banners, articles, videos and lists (e.g. “Popular restaurants”, “New restaurants”). Discovery is customized for each user based on their location, personal preferences and order history.

In this assignment you get to follow in the footsteps of Wolt developers and create a Discovery page, although a much simplified version (we don’t want you to spend hundreds of hours on this task 😀).

In the backend version you will generate new / popular / nearby restaurant lists from the given data by taking the location of a customer into account. The frontend task is about rendering such content as horizontal carousels. You will also get to use one of our popular open source libraries, Blurhash in the frontend version.

It should take about 4-8 hours to complete this assignment. However, the best way to make your assignment really stand out is to finish it with care - the last 10% is often the most important part of any software project.

# Backend

restaurants.json in the repository contains one hundred restaurants from the Helsinki area.

Your task is to create an API endpoint /discovery that takes coordinates of the customer as an input and then returns a page (JSON response) containing most popular, newest and nearby restaurants (based on given coordinates).

Location of a customer needs to be provided as request parameters lat (latitude) and lon (longitude), e.g. /discovery?lat=60.1709&lon=24.941. Both parameters accept float values.

For each restaurants-list you need to add maximum 10 restaurant objects. A list can also contain fewer restaurants (or even be empty) if there are not enough objects matching given conditions. A section with an empty restaurants-list should be removed from the response.

So how do you know which restaurants to add to each list?

There are two main rules to follow:

All restaurants returned by the endpoint must be closer than 1.5 kilometers from given coordinates, measured as a straight line between coordinates and the location of the restaurant.
Open restaurants (online=true) are more important than closed ones. Every list must be first populated with open restaurants, and only adding closed ones if there is still capacity left.
In addition each list has a specific sorting rule:

“Popular Restaurants”: highest popularity value first (descending order)
“New Restaurants”: Newest launch_date first (descending). This list has also a special rule: launch_date must be no older than 4 months.
“Nearby Restaurants”: Closest to the given location first (ascending).
Remember to cap each list to max. 10 best matching restaurants. The same restaurant can obviously be in multiple lists (if it matches given criteria).
