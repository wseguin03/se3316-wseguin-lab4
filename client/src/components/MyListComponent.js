import React, { useEffect, useState } from 'react'
import MainScreenComponent from './MainScreenComponent'
import './MyListComponent.css'
import { Container, Row,Card, Col, Button, Dropdown } from 'react-bootstrap';
const MyListComponent = () => {
  const [selectedList, setSelectedList] = useState(null);
  const [listInfo, setListInfo] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loginState, setLoginState] = useState(false);
  const [privateLists, setPrivateLists] = useState([]);
  const [selectedHero, setSelectedHero] = useState(null);
  const [listData, setListData] = useState([]);
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const handlePrivacyChange = (privacy) => {
  // handle the privacy setting change
  console.log('Selected privacy: ', privacy);
};
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if(userInfo){
      setLoginState(true);
    }
  }, []); // Empty dependency array means this effect runs once on mount
  useEffect(() => {
    if(userInfo && userInfo.token){
      fetch('/api/lists', {
        headers: {
          'Authorization': `Bearer ${userInfo.token}`
        }
      })
      .then((response) => response.json())
      .then((data) => {
        setPrivateLists(data.sort((a, b) => new Date(b.lastChanged) - new Date(a.lastChanged)));        // console.log("Private Lists: "+JSON.stringify(privateLists))
      })
      .catch((error) => {
        console.error('Error fetching data: ', error);
      });
    }
  }, []);

  
  useEffect(() => {
    if (privateLists.length > 0) {
      // Only run if lists is not empty
      Promise.all(privateLists.map(list =>
        fetch(`list-db/${list.name}`)
          .then((response) => response.json())
      ))
      .then(dataArray => {
        // Sort the lists by lastChanged date in descending order
        const sortedDataArray = dataArray.sort((a, b) => new Date(b.lastChanged) - new Date(a.lastChanged));

        setListInfo(sortedDataArray);
        setLoading(false); // Set loading to false here, after listInfo is set
      })
      .catch((error) => {
        console.error('Error fetching data: ', error);
      });
    }
  }, [privateLists]);
  
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




  const handleDeleteList = (listId) => {
    const confirmed = window.confirm('Are you sure you want to delete this list?');
    if (confirmed) {
      // Assuming you have an API endpoint to delete the list and associated reviews
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (userInfo && userInfo.token) {
        fetch(`/api/lists/${listId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${userInfo.token}`
          },
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to delete list');
            }
            return response.json();
          })
          .then(data => {
            console.log('List deleted successfully:', data);
            window.location.reload();         })
          .catch(error => {
            console.error('Error deleting list:', error);
          });
      } else {
        console.error('User not authenticated');
      }
    }
  };


  if (!loginState) {
    return (
      <div>
        <h2>You must be logged in to view this page</h2>
      </div>
    )
  }else{
  
    return (
      <MainScreenComponent title="Private-Lists">
        <Row>
          <Container>
            <ul className="private-lists">
              {privateLists.map((list, index) => (
                <li key={index} className="superhero-item">
                  <Card>
                    <Card.Header>{list.name}</Card.Header>
                    <Card.Body>
                      <Row className="list-body">
                        <Col className="list-body-column">
                          <Card.Text>
                            {!loading && listInfo.length > 0 && listInfo[index] ? (
                              <>
                                <p>
                                  <strong>Created By:</strong>{' '}
                                  {listInfo[index].user}
                                </p>
                              </>
                            ) : null}
                          </Card.Text>
                        </Col>
                        <Col className="list-body-column">
                          <Card.Text>
                            {!loading && listInfo.length > 0 && listInfo[index] ? (
                              <>
                                <p><strong>Last Changed:</strong></p>
                                <p>
                                  {new Date(listInfo[index].lastChanged)
                                    .toISOString()
                                    .slice(0, 16)}
                                </p>
                              </>
                            ) : null}
                          </Card.Text>
                        </Col>
                        <Col className="list-body-column">
                          <Card.Text>
                            <strong>Number of Heroes:</strong> {list.list.length}
                            <br />
                          </Card.Text>
                        </Col>
              
                        <Col className="list-body-column">
                          <Card.Text>
                            <strong>Public: </strong> {list.public ? 'Yes' : 'No'}
                            <br />
                          </Card.Text>
                        </Col>
                      </Row>
                      {selectedList === list && listInfo[index] && listInfo[index].results ? (
                        <Card>
                          <Card.Text id="desc-tag">
                            <h5>
                              <strong>Description:</strong> {list.description}{' '}
                              <br />
                            </h5>
                          </Card.Text>
                          <Card.Header>Hero Data</Card.Header>
                          <Card.Body>
                            {listInfo[index].results.map((hero, heroIndex) => (
                              <div key={heroIndex}>
                                <br />
                                <h4>
                                  <strong>Hero Name:</strong> {hero.info.name}{' '}
                                  <br />
                                </h4>
                                <strong>Publisher:</strong> {hero.info.Publisher}{' '}
                                <br />
                                <strong>Powers:</strong> {Object.entries(hero.power).map(([key, value], i) => (
                                  value ? <span key={i}>{key}, </span> : null
                                ))}
                                <br />
                                {selectedHero === hero ? (
                                  <>
                                    <strong>Race:</strong> {hero.info.Race} <br />
                                    <strong>Gender:</strong> {hero.info.Gender} <br />
                                    <strong>Eye color:</strong> {hero.info["Eye color"]} <br />
                                    <strong>Hair color:</strong> {hero.info["Hair color"]} <br />
                                    <strong>Height:</strong> {hero.info.Height} cm <br />
                                    <strong>Skin color:</strong> {hero.info["Skin color"]} <br />
                                    <strong>Alignment:</strong> {hero.info.Alignment} <br />
                                    <strong>Weight:</strong> {hero.info.Weight} kg <br />
                                  </>
                                ) : null}
                                <Button
                                  variant="primary"
                                  onClick={() => handleToggleHeroClick(hero)}
                                >
                                  View Hero
                                </Button>
                              </div>
                            ))}
                            <Button id="edit-btn" variant="primary" href={`/lists/${list._id}`}>
                              Edit
                            </Button>
                            <Button
                            id="delete-btn"
                            variant="danger"
                            onClick={() => handleDeleteList(list._id)}
                         >
                      Delete
                    </Button>
                          </Card.Body>
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
  };
  }


export default MyListComponent
