import React, { useEffect, useState } from 'react'
import MainScreenComponent from './MainScreenComponent'
import './PublicListComponent.css'
import { Container, Row,Card, Col, Button } from 'react-bootstrap';
import ErrorMessage from './ErrorMessage';
import { set } from 'mongoose';

const PublicListComponent = () => {
  const [lists, setLists] = useState([]);
  const [loginState, setLoginState] = useState(false);
  const [selectedList, setSelectedList] = useState(null);
  const [listInfo, setListInfo] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedHero, setSelectedHero] = useState(null);
  const [rating, setRating] = useState([]);

  const token = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).token : null;
  const [listReviews, setListReviews] = useState([]);

useEffect(() => {
  const sortedLists = [...lists].sort((a, b) => new Date(b.lastChanged) - new Date(a.lastChanged));
  fetchListReviews(sortedLists);
}, [lists]);

const fetchListReviews = async (sortedLists) => {
  const reviewsAndRatingsForAllLists = await Promise.all(sortedLists.map(fetchReviewsForList));
  setListReviews(reviewsAndRatingsForAllLists);
};

const fetchReviewsForList = async (list) => {
  const response = await fetch(`/api/lists/${list._id}/reviews`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  const unflaggedReviews = data.filter(review => !review.flagged);
  const averageRating = unflaggedReviews.reduce((total, review) => total + review.rating, 0) / unflaggedReviews.length;
  console.log("Average Rating: "+averageRating);

  return { reviews: unflaggedReviews, averageRating };
};


  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if(userInfo){
      setLoginState(true);
    }
  }, []); // Empty dependency array means this effect runs once on mount
  
  useEffect(() => {
    setLoading(true);
    fetch('/create-list')
      .then((response) => response.json())
      .then((data) => {
        const publicLists = data
          .filter(list => list.public === true)
          .sort((a, b) => new Date(b.lastChanged) - new Date(a.lastChanged));
        setLists(publicLists);
        // console.log("Public Lists: "+JSON.stringify(publicLists))
      })
      .catch((error) => {
        console.error('Error fetching data: ', error);
      });
  }, []);

  useEffect(() => {
    if (lists.length > 0) {
      // Only run if lists is not empty
      Promise.all(lists.map(list =>
        fetch(`list-db/${list.name}`)
          .then((response) => response.json())
      ))
      .then(dataArray => {
        // Sort the lists by lastChanged date in descending order
        const sortedDataArray = dataArray.sort((a, b) => new Date(b.lastChanged) - new Date(a.lastChanged));

        setListInfo(sortedDataArray);
        console.log("List Info: "+JSON.stringify(listInfo))
        setLoading(false); // Set loading to false here, after listInfo is set
      })
      .catch((error) => {
        console.error('Error fetching data: ', error);
      });
    }
  }, [lists]);
  



  const handleToggleListClick = (list) => {
    setSelectedList((prevSelectedList) =>
      prevSelectedList === list ? null : list
    );
    // Reset selected hero when toggling lists
    setSelectedHero(null);
  };

  const handleToggleHeroClick = (hero) => {
    setSelectedHero((prevSelectedHero) =>
      prevSelectedHero === hero ? null : hero
    );
  };


return (
  <MainScreenComponent title="Public Lists">
    <Row>
      <Container>
        <ul className="public-lists">
          {lists.slice(0, 10).map((list, index) => (
            <li key={index} className="superhero-item">
              <Card>
                <Card.Header>{lists[index].name}</Card.Header>                
                <Card.Body>
                  <Row className='list-body'>
                    <Col className='list-body-column'>
                      <Card.Text>
                        {!loading && listInfo.length > 0 && listInfo[index] ? (
                          <p><strong>Created By:</strong> {listInfo[index].user}</p>
                        ) : null}
                      </Card.Text>
                    </Col>
                    <Col className='list-body-column'>
                      <Card.Text>
                        {!loading && listInfo.length > 0 && listInfo[index] ? (
                          <p><strong>Last Changed:</strong> {
                            new Date(listInfo[index].lastChanged).toISOString().slice(0, 16)
                          }</p>
                        ) : null}
                      </Card.Text>
                    </Col>
                    <Col className='list-body-column'>
                      <Card.Text>
                        <strong>Number of Heroes:</strong> {list.list.length}<br />
                      </Card.Text>
                    </Col>
                    <Col className='list-body-column'>
                      <Card.Text>
                      <strong>Average rating:</strong> {listReviews[index] && listReviews[index].averageRating.toFixed(1)}<br />                      </Card.Text>
                    </Col>
                  </Row>
                  {selectedList === list && listInfo[index] && listInfo[index].results ? (
                    <Card>
                        <Card.Text id="desc-tag">
                          <h5>
                          <strong>Description:</strong> {listInfo[index].description}{' '}                            <br />
                          </h5>
                         
                        </Card.Text>
                        <Button id="review-btn" variant="primary" href={`lists/${list._id}/review`}>
                              Review List
                            </Button>
                      <Card.Header>Hero Data</Card.Header>
                      <Card.Body>
                        {listInfo[index].results.map((hero, heroIndex) => (
                          <div key={heroIndex}>
                            <h4><strong>Hero Name:</strong> {hero.info.name} <br /></h4>
                            <strong>Publisher:</strong> {hero.info.Publisher}
                           
                            {selectedHero === hero ? (
                            
                            <div>
                               <strong>Powers:</strong> {Object.entries(hero.power).map(([key, value], i) => (
                                  value ? <span key={i}>{key}, </span> : null
                                ))} <br />
                              <strong>Race:</strong> {hero.info.Race} <br />
                              <strong>Gender:</strong> {hero.info.Gender} <br />
                              <strong>Eye color:</strong> {hero.info["Eye color"]} <br />
                              <strong>Hair color:</strong> {hero.info["Hair color"]} <br />
                              <strong>Height:</strong> {hero.info.Height} cm <br />
                              <strong>Skin color:</strong> {hero.info["Skin color"]} <br />
                              <strong>Alignment:</strong> {hero.info.Alignment} <br />
                              <strong>Weight:</strong> {hero.info.Weight} kg
                            </div>
                            ) : null}
                             <br />
                              <Button
                                variant="primary"
                                onClick={() => handleToggleHeroClick(hero)}
                              >
                                View Hero
                              </Button>
                            </div>
                        ))}
                      </Card.Body>
                      <Card className='review-card'>
                          <h4>Reviews:</h4>
                          {listReviews[index] && listReviews[index].reviews.map((review, reviewIndex) => (
                            <div key={reviewIndex} className='review-item'>
                              <p><strong>Left By:</strong> {review.user}</p>
                              <p><strong>Rating:</strong> {review.rating}/5</p>
                              <p><strong>Comment:</strong> {review.comment}</p>
                              <p><strong>Time:</strong> {new Date(review.ratingTime).toISOString().slice(0, 16)}</p>
                            </div>
                          ))}
                        </Card>
                    </Card>
                    
                  ) : null}
                </Card.Body>
                <Button
                  variant="primary"
                  onClick={() => handleToggleListClick(list)}
                >
                  View List
                </Button>
              </Card>
            </li>
          ))}
        </ul>
      </Container>
    </Row>
  </MainScreenComponent>
);

}

export default PublicListComponent;


