import { useRef, useState, useCallback, useEffect } from 'react';

import Places from './components/Places.jsx';
import Modal from './components/Modal.jsx';
import DeleteConfirmation from './components/DeleteConfirmation.jsx';
import logoImg from './assets/logo.png';
import AvailablePlaces from './components/AvailablePlaces.jsx';
import { fetchUserPlaces, updateUserPlaces } from './http.js';
import ErrorPage from './components/Error.jsx';

function App() {
  const selectedPlace = useRef();

  const [userPlaces, setUserPlaces] = useState([]);
  const [errorUpdatingPlaces, setErrorUpdatingPlaces] = useState(null);
  const [errorFetchingUserPlaces, setErrorFetchingUserPlaces] = useState(null);
  const [fetchingUserPlaces, setFetchingUserPlaces] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    async function fetchUserPlacesFromDB() {
      setFetchingUserPlaces(true);
      try {
        const places = await fetchUserPlaces();
        setUserPlaces(places);
        
      } catch(error) {
        setFetchingUserPlaces(false);
        setErrorFetchingUserPlaces(error.message || "The fetch operation cannot be completed, please try again later.");
      }
    }
    fetchUserPlacesFromDB();
    setFetchingUserPlaces(null);
  }, []);
  
  
  function handleStartRemovePlace(place) {
    setModalIsOpen(true);
    selectedPlace.current = place;
  }

  function handleStopRemovePlace() {
    setModalIsOpen(false);
  }

  async function handleSelectPlace(selectedPlace) {
    setUserPlaces((prevPickedPlaces) => {
      if (!prevPickedPlaces) {
        prevPickedPlaces = [];
      }
      if (prevPickedPlaces.some((place) => place.id === selectedPlace.id)) {
        return prevPickedPlaces;
      }
      return [selectedPlace, ...prevPickedPlaces];
    });

    try {
      await updateUserPlaces([selectedPlace, ...userPlaces]);
    }catch (error) {
      setUserPlaces(userPlaces);
      setErrorUpdatingPlaces(error.message || "There's an error when updating the places. Please try again later.");
    }
  }

  const handleRemovePlace = useCallback(async function handleRemovePlace() {
    setUserPlaces((prevPickedPlaces) =>
      prevPickedPlaces.filter((place) => place.id !== selectedPlace.current.id)
    );
    setModalIsOpen(false);

    try {
      await updateUserPlaces(userPlaces.filter( (place) => place.id !== selectedPlace.current.id));
    }catch (error) {
      setUserPlaces(userPlaces);
      setErrorUpdatingPlaces(error.message || "There's an error when deleting this place. Please try again later.");
    }
  }, [userPlaces]);

  function handleErrorAcceptation() {
    setErrorUpdatingPlaces(null);
    setErrorFetchingUserPlaces(null);
  }

  return (
    <>
    <Modal open={errorUpdatingPlaces} onClose={handleErrorAcceptation}>
      {errorUpdatingPlaces && (<ErrorPage title="An error ocurred!" 
        message={errorUpdatingPlaces}
        onConfirm={handleErrorAcceptation}
        />)
      }
    </Modal>
      <Modal open={modalIsOpen} onClose={handleStopRemovePlace}>
        <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
        />
      </Modal>

      <header>
        <img src={logoImg} alt="Stylized globe" />
        <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>
      <Modal open={errorFetchingUserPlaces} onClose={handleErrorAcceptation}>
        {errorFetchingUserPlaces && (<ErrorPage title="An error ocurred!" 
          message={errorFetchingUserPlaces}
          onConfirm={handleErrorAcceptation}
          />)
        }
        </Modal>
        
        {!errorFetchingUserPlaces && (
          <Places
            title="I'd like to visit ..."
            isLoading={fetchingUserPlaces}
            loadingText={'Loading your selected places'}
            fallbackText={"Select the places you would like to visit below."}
            places={userPlaces}
            onSelectPlace={handleStartRemovePlace}
          />
        )}

        <AvailablePlaces onSelectPlace={handleSelectPlace}  />
      </main>
    </>
  );
}

export default App;
