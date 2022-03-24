import React, { useEffect, useState } from "react";
import Popup from './modal-portal';

const SearchComponent = () => {
    const setRecentSearch = value => window.localStorage.setItem('recentSearch', JSON.stringify(value));
    const getRecentSearch = () => {
        const value = window.localStorage.getItem('recentSearch');
        return value != null ? JSON.parse(value) : {};
    }
    const [photos, setPhotos] = useState([]);
    const [suggestions, setSuggestions] = useState(getRecentSearch() || []);
    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState(true);
    const [showSuggestion, setShowSuggestion] = useState(false);
    const [totalPage, setTotalPage] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [activeSrc, setActiveSrc] = useState('');

    const debounce = (fn, delay) => {
        var timer = null;
        return function () {
            var context = this,
                args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () {
                fn.apply(context, args);
            }, delay);
        };
    }

    const loadImages = (pageCount = 1) => {
        const token = 'c8080ff1b61237132e48a71df4f3f005';
        const defaultUrl = `https://www.flickr.com/services/rest/?method=flickr.photos.getRecent&api_key=${token}&format=json&nojsoncallback=1&page=${pageCount}`;
        const searchUrl = `https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=${token}&&text=${keyword}&format=json&nojsoncallback=1&page=${pageCount}`;
        const url = keyword ? searchUrl : defaultUrl;
        const response = fetch(url);
        response
            .then((data) => {
                console.log("1", data);
                return data.json();
            })
            .then((data) => {

                setLoading(false);
                if (keyword) {
                    setSuggestions(preV => !preV.includes(keyword)  ? [...preV, keyword] : [...preV]);
                }
                
                setTotalPage(data.photos.total);
                return setPhotos(list => [...list, ...data.photos.photo] || []);

            });
    }

    useEffect(() => {
        loadImages();
    }, [keyword]);

    const handleScroll = () => {
        if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight) {
            const pageCount = currentPage + 1;
            setCurrentPage(pageCount);
            loadImages(pageCount)
            console.log('doen', pageCount);

        }
    }

    React.useEffect(() => {
        
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        }
    }, []);

    React.useEffect(() => {
        suggestions && suggestions.length > 0 ? setRecentSearch(suggestions) : null;
    }, [suggestions]);

    const handleChange = (event) => {
        const { value } = event.target;
        setCurrentPage(1);
        setPhotos([]);
        setKeyword(value);

    };

    const handleBlur = (event) => {
        event.preventDefault();
        const { value } = event.target;
        setShowSuggestion(false);
    };
    const handleFocus = (event) => {
        const { value } = event.target;
        setShowSuggestion(true);
    };

    const handleClear = (event) => {
        setSuggestions([]);
        setRecentSearch([]);
    };

    const handleSugClick = (item) => {
        setKeyword(item);
        loadImages();
    }

    const handleImageClick = (item) => {
        setActiveSrc(item);
        setShowModal(true);
    };
    const renderModal = () => {

        return <Popup
            showModal={showModal}
            handleClose={() => setShowModal(false)}
            modalTitle="Image"
            modalBody={<img src={activeSrc} />}
        />
    }

    

    console.log("updated", photos);
    return (
        <div className="main-div">
            <header>
                <div className="header-container">
                    <div className="header-wrapper">
                        <div className="search-container"><label>Search Photos</label></div>
                        <input type="search" onChange={debounce(handleChange, 1000)} onBlur={debounce(handleBlur, 200)} onFocus={handleFocus} placeholder="Search photo..." autoSave="SEARCH" name="search" />
                        {showSuggestion && <div>
                            <ol id='list'>
                                {suggestions && suggestions.length > 0 && suggestions.map(((suggestion, index) => {
                                    return <li key={index} className="suggestions" onClick={() => handleSugClick(suggestion)}>{suggestion}</li>
                                }))}

                                {showSuggestion && suggestions && suggestions.length > 0 && <li id="clear" className="suggestions-clear"><button onClick={handleClear} style={{ float: 'right' }}>CLEAR</button></li>}

                            </ol>
                        </div>}
                    </div>
                </div>
            </header>

            <div className="container">
                {loading && <div className="spin"></div>}
                <div>
                    {photos && photos.length > 0 ?
                        photos.map((items, index) => {
                            const farmId = items.farm;
                            const serverId = items.server;
                            const id = items.id;
                            const secret = items.secret;
                            const src = `https://farm${farmId}.staticflickr.com/${serverId}/${id}_${secret}.jpg`;
                            const image = <img key={index} src={src} onClick={() => handleImageClick(src)} />;
                            return image;
                        }) : <div>No record found.</div>
                    }
                    {showModal && renderModal()}
                </div>
            </div>
        </div>
    );
};

export default SearchComponent;
