// Wait for the DOM to fully load
document.addEventListener('DOMContentLoaded', () => {
    const adsContainer = document.getElementById('ads');

    // Sample ads (replace this with data from your backend)
    const ads = [
        { title: 'New Car for Sale', description: 'Check out our latest electric car models!', link: '#' },
        { title: 'Tech Gadgets', description: 'Find the best deals on new tech gadgets.', link: '#' },
        { title: 'Travel Deals', description: 'Exclusive travel offers to top destinations.', link: '#' }
    ];

    // Function to display ads
    function displayAds() {
        ads.forEach(ad => {
            const adElement = document.createElement('div');
            adElement.classList.add('ad');
            adElement.innerHTML = `
                <h3>${ad.title}</h3>
                <p>${ad.description}</p>
                <a href="${ad.link}">Buy Link</a>
            `;
            adsContainer.appendChild(adElement);
        });
    }

    // Call the function to display ads on page load
    displayAds();

    // Hook up the "Home" button click event
    const homeButton = document.getElementById('home-btn');

    homeButton.addEventListener('click', function() {
        console.log('Home button clicked!');

        // Clear current ads from the container
        adsContainer.innerHTML = '';

        // Optionally, you can display a custom message or reload the ads
        // For example, display the same ads again (as a reset action)
        displayAds();
    });
});
