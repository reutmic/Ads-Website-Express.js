(function () {

    const ERR_GENERAL = "Some error occurred, please try again later.";

    /**
     * This function executes fetch in order to get the ads from the sequelize ads table, and displays
     * only the approved ads on the main page.
     */
    async function fetchAndDisplayAds() {
        const dataElement = document.getElementById("data")
        try {
            // getting the ads:
            const response = await fetch('./api/ads');
            if (response.status !== 200)
                throw new Error(response.statusText);

            const data = await response.json();
            let adsData = "";       // for displaying the approved ads

            // showing the most recent ads using the reverse() funtion:
            data.reverse().forEach((ad) => {
                if (ad.approved === true) {
                    adsData += `<li class="row">
            <div class="col-2">
                <h4>${ad.title}</h4>
                <p>Price: ${ad.price}</p>
            </div>
            <div class="col-3"><p>`;
                    if (ad.description !== "") {
                        adsData += `${ad.description}</p></div>`;
                    }
                    else {
                        adsData += `No description available.</p></div>`;
                    }
                    adsData += `<div class="col-2">
                <p>Contacts:</p>
                <p>${ad.email}</p>
                <p>${ad.phoneNumber}</p>
            </div>
        </li>`;
                }
            });

            document.getElementById("approvedAds").innerHTML = `${adsData}`;

        } catch (err) {
            dataElement.innerHTML = `${ERR_GENERAL} ${err.message}`;
        }
    }

    //////////

    /**
     * This is the DOMContentLoaded event for the landing/main page:
     */
    document.addEventListener('DOMContentLoaded', function () {
        // displaying the approved ads:
        fetchAndDisplayAds();
    });

})();