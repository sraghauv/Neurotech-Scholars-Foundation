// Event component for the Events page
import PropTypes from 'prop-types';
import {PRUSSIAN_BLUE, VANILLA} from './colors.js';

/* 
    Takes in all properties of event and returns 
    a newly generated event with these properties
    to add onto the Events page for display. 
*/
const Event = ({ event }) => {

    console.log(`Event received in Event component:`, event);

    const { name, date, location, details, type, image } = event;

    // Provide a placeholder image if the event provided doesn't have an image URL.
    const placeholderImage = "https://via.placeholder.com/150";

    return (
        <div style={{minHeight: '50em'}} className="event-card border p-4 pb-1 rounded-xl shadow-sm bg-white mb-1">
            <span style={{backgroundColor: VANILLA}} className="event-type badge mt-0.5 mb-4 text-base text-black heading">{type}</span>
            <img 
                src={image || placeholderImage} 
                alt={`${name} image`} 
                className="event-image w-full h-50 object-contain rounded mb-4" 
            />
            <div  className="flex flex-col flex-wrap flex-auto">
                <h2 style={{color: PRUSSIAN_BLUE}} className="text-2xl mb-2 heading font-bold">{name}</h2>
                <p className="mb-2 text-base normal baseText">{details}</p>
                <p className="text-lg baseText"><strong>Date:</strong> {new Date(date).toLocaleDateString()}</p>
                {location && <p className="text-lg baseText"><strong>Location:</strong> {location}</p>} {/* Only display location if provided */}
            </div>
        </div>
    );
};

Event.propTypes = {
    event: PropTypes.shape({
        name: PropTypes.string.isRequired,
        date: PropTypes.instanceOf(Date).isRequired,
        location: PropTypes.string,
        details: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        image: PropTypes.string,
    }).isRequired,
};

export default Event;
