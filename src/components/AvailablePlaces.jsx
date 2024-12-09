import { useState, useEffect } from 'react';
import Places from './Places.jsx';
import ErrorPage from './Error.jsx';
import { sortPlacesByDistance } from "../loc.js";
import { fetchAvailablePlaces } from '../http.js';

export default function AvailablePlaces({ onSelectPlace }) {
  const [isFetching, setIsFetching]  = useState(false);
  const [availablePlaces, setAvailablePlaces]  = useState([]);
  const [error, setError] = useState(false);
    
  useEffect(() => {
    async function fetchPlaces() {
      setIsFetching(true);
      try {
        const places = await fetchAvailablePlaces();
        
        navigator.geolocation.getCurrentPosition( (position) => {
           const sortedPlaces = sortPlacesByDistance(places, position.coords.latitude, position.coords.longitude)
           setAvailablePlaces(sortedPlaces);
           setIsFetching(false);
        });
        
        
      } catch(error) {
        setIsFetching(false);
        setError(error.message || "The fetch operation cannot be completed, please try again later.");
      }
      
      setIsFetching(false);
    }
    
    fetchPlaces();
    
    // Versión 2  
    // fetch("http://localhost:3000/places").then((reponse) => {
    //   return reponse.json();
    // }).then((respData) => {
    //   setAvailablePlaces(respData.places);
    // });
  }, []);

  if(error) {
    return <ErrorPage title="An error ocurred" message={error}/>;

  }

  return (
    <Places
      title="Available Places"
      places={availablePlaces}
      isLoading={isFetching}
      loadingText="Loading places..."
      fallbackText="No places available."
      onSelectPlace={onSelectPlace}
    />
  );
}
