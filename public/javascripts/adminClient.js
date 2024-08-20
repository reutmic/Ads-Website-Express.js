(function () {

    const ERR_GENERAL = "Some error occurred, please try again later.";

    /**
     * This function executes fetch in order to get the ads from the sequelize ads table, and displays
     * them on the admin page.
     */
    async function fetchAndDisplayAds() {
        const dataElement = document.getElementById("errData")
        try {
            // getting the ads:
            const response = await fetch('/api/ads');
            if (response.status !== 200)
                throw new Error(response.statusText);

            const data = await response.json();
            let adsData = "";   // for displaying the ads

            // using the reverse() function to show the recent ads first:
            data.reverse().forEach((ad) => {
                adsData += `<li class="row">
            <div class="col-2">
                <h4>${ad.title}</h4>
                <p>Price: ${ad.price}</p>
            </div>`;
                if (ad.description !== "") {
                    adsData += `<div class="col-3">
                <p>${ad.description}</p>
            </div>`;
                }
                else {
                    adsData += `<div class="col-3">
                <p>No description available.</p>
            </div>`;
                }
                adsData += `<div class="col-2">
                <p>Contacts:</p>
                <p>${ad.email}</p>
                <p>${ad.phoneNumber}</p>
            </div>
            <div class="col-2">`;
                // adding an "approve" button for ads that are not approved:
                    if (ad.approved === false) {
                        adsData += `<button type="button" class="btn btn-success btn-sm approve-button mb-2" data-id="${ad.id}">Approve ad</button> `;
                    }

                    // adding a delete button for each ad:
                    adsData += `<button type="button" class="btn btn-danger btn-sm delete-button mb-2" data-id="${ad.id}">Delete</button></div></li>`;

            });

            document.getElementById("allAds").innerHTML = `${adsData}`;

        } catch (err) {
            dataElement.innerHTML = `${ERR_GENERAL} ${err.message}`;
        }
    }


    /**
     * This event handles event on the admin page:
     */
    document.addEventListener('DOMContentLoaded', function () {
        //displaying all ads:
        fetchAndDisplayAds();

        ///////////

        /**
         * This event listener is for handling the "delete" button event:
         */
        document.addEventListener('click', async function(event) {
            if (event.target.classList.contains('delete-button')) {
                // getting the id of the ad associated with the clicked button:
                const adId = event.target.dataset.id;

                try {
                    // Make a DELETE request to delete the ad:
                    const response = await fetch(`/user/delete/${adId}`, {
                        method: 'DELETE'
                    });

                    if (response.ok) {
                        event.target.closest('li').remove();
                        console.log('Ad deleted successfully');
                    } else {
                        console.error('Failed to delete ad');
                    }
                } catch (error) {
                    console.error('Error deleting ad:', error);
                }
            }
        });

        /////////////////

        /**
         * This event listener is for handling the "approve ad" button event:
         */
        document.addEventListener('click', async function(event) {
            if (event.target.classList.contains('approve-button')) {
                // Retrieve the ID of the ad associated with the clicked button
                const adId = event.target.dataset.id;

                try {
                    // Make a PATCH request to update the 'approved' attribute of the ad
                    const response = await fetch(`/user/approve/${adId}`, {
                        method: 'PATCH'
                    });

                    if (response.ok) {  // if the ad was approved successfully:
                        console.log('Ad approved successfully');

                        // remove the "Approve ad" button for this specific ad:
                        event.target.remove();
                    } else {
                        console.error('Failed to approve ad');
                    }
                } catch (error) {
                    console.error('Error approving ad:', error);
                }
            }
        });
    });
})();