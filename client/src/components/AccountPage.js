import React, { useEffect, useState } from 'react';
import BaseLayout from './BaseLayout';
import "../App.css";
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useView } from '../context/ViewContext';

const AccountPage = () => {
    const { authData, updateUserAttribute} = useAuth();
    const {viewID} = useView();
    const [loading, setLoading] = useState(false);
    const [profilePicError, setProfilePicError] = useState('');
    const [userInfo, setUserInfo] = useState({
        username: viewID === '' ? authData.user?.firstName + " " + authData.user?.lastName : '',
        profilePicture: (viewID === '' || authData.user?.profile_picture === 'large') ? authData.user?.profile_picture : '',
        points: viewID === '' ? authData.user?.score : '', // Default points value
        favoriteNFLTeam: viewID === '' ? authData.user?.favorite_nfl_team : '', // Default favorite NFL team
        favoriteNBATeam: viewID === '' ? authData.user?.favorite_nba_team : '' // Default favorite NBA team
    });

    /*
useEffect(() => {
    document.body.classList.add("settings-page-bg");

    return () => {
      document.body.classList.remove("settings-page-bg");
    };
  }, []);

    */

    useEffect(() => {
        document.body.classList.add("account-page-bg")
        const getProfileInfo = async () => {
                console.log("Viewing another user's profile: ", viewID);
                setLoading(true);
                    try {
                        if(viewID === '')
                        {
                            console.log("Pulling info from own profile");
                            var info = await axios.get(`http://localhost:5001/data/get-user/${authData.user?.id}`);
                        }
                        else
                        {
                            var info = await axios.get(`http://localhost:5001/data/get-user/${viewID}`);
                        }
                        console.log(info.data);
                        setUserInfo(prevUserInfo => ({...prevUserInfo, username: info.data.firstName + " " + info.data.lastName, profilePicture: info.data.profile_picture, points: info.data.score, favoriteNFLTeam: info.data.favorite_nfl_team, favoriteNBATeam: info.data.favorite_nba_team}));
                        setLoading(false);
                    } catch (error) {
                        console.error(error);
                        setLoading(false);
                    }
        }
        if(viewID !== '' || authData.user?.profile_picture === 'large')
            getProfileInfo();
        else
            setUserInfo({username: authData.user?.firstName + " " + authData.user?.lastName, profilePicture: authData.user?.profile_picture, points: authData.user?.score, favoriteNFLTeam: authData.user?.favorite_nfl_team, favoriteNBATeam: authData.user?.favorite_nba_team});
            return () => {
                document.body.classList.remove("account-page-bg");
            }
    }, [])

    const handleProfilePictureChange = async (e) => {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        var large = false;
        const file = e.target.files[0];
        if (!file) {
            console.log('No file selected.');
            return;
        }
        formData.append('profilePicture', e.target.files[0]);
        const fileSize = file.size / 1024 / 1024;
        const allowedExtensions = ['png', 'jpg', 'jpeg'];
        const fileExtension = e.target.files[0].name.split('.').pop().toLowerCase();

        if (!allowedExtensions.includes(fileExtension)) {
            console.log('Invalid file extension. Only PNG, JPG, and JPEG files are allowed.');
            setProfilePicError('Invalid file type. Only PNG, JPG, and JPEG are allowed.');
            return;
        }
        else if (fileSize > 5) {
            console.log('File is large. It cannot be stored in local storage.');
            updateUserAttribute('profile_picture', 'large');
            large = true;
            setProfilePicError('');
        }
        else{
            setProfilePicError('');
        }

        const response = await axios.post(`http://localhost:5001/user/update-profile-picture`, formData, {
            headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
            }
        })
            .catch(error => {
            console.log("Caught error!")
            console.error('Error:', error.response.data);
            return Promise.reject(error);
            });
        if (response.status === 200) {
            console.log("Response was good. The profile picture is: ", response.data.profile_picture);
            if(!large)
                updateUserAttribute('profile_picture', response.data.profile_picture);
            setUserInfo({...userInfo, profilePicture: response.data.profile_picture});
        }
        else {
            console.log("Status: ", response.status)
        }
    };

    const handleSelectFavoriteNFLTeam = async (e) => {
        const token = localStorage.getItem('token');
        const selectedTeam = e.target.value;
        const updatedUserInfo = { ...userInfo, favoriteNFLTeam: selectedTeam };
        setUserInfo(updatedUserInfo);

        const response = await axios.post(`http://localhost:5001/user/update-favorite-nfl-team`, {
            selectedTeam: selectedTeam
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
            .catch(error => {
                console.error('Error:', error.response.data);
            });
        if (response.status === 200) {
            console.log("Response was good. The favorite nfl team is: ", response.data.favorite_nfl_team);
            updateUserAttribute('favorite_nfl_team', response.data.favorite_nfl_team);
        }
        else {
            console.log("Status: ", response.status)
        }
    };

    const handleSelectFavoriteNBATeam = async (e) => {
        const token = localStorage.getItem('token');
        const selectedTeam = e.target.value;
        const updatedUserInfo = { ...userInfo, favoriteNBATeam: selectedTeam };
        setUserInfo(updatedUserInfo);

        const response = await axios.post(`http://localhost:5001/user/update-favorite-nba-team`, {
            selectedTeam: selectedTeam
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
            .catch(error => {
                console.error('Error:', error.response.data);
            });
        if (response.status === 200) {
            console.log("Response was good. The favorite nfl team is: ", response.data.favorite_nba_team);
            updateUserAttribute('favorite_nba_team', response.data.favorite_nba_team)
        }
        else {
            console.log("Status: ", response.status)
        }
    };

    const nflTeams = [
        "Arizona Cardinals", "Atlanta Falcons", "Baltimore Ravens", "Buffalo Bills",
        "Carolina Panthers", "Chicago Bears", "Cincinnati Bengals", "Cleveland Browns",
        "Dallas Cowboys", "Denver Broncos", "Detroit Lions", "Green Bay Packers",
        "Houston Texans", "Indianapolis Colts", "Jacksonville Jaguars", "Kansas City Chiefs",
        "Las Vegas Raiders", "Los Angeles Chargers", "Los Angeles Rams", "Miami Dolphins",
        "Minnesota Vikings", "New England Patriots", "New Orleans Saints", "New York Giants",
        "New York Jets", "Philadelphia Eagles", "Pittsburgh Steelers", "San Francisco 49ers",
        "Seattle Seahawks", "Tampa Bay Buccaneers", "Tennessee Titans", "Washington Football Team"
    ];

    const nbaTeams = [
        "Atlanta Hawks", "Boston Celtics", "Brooklyn Nets", "Charlotte Hornets",
        "Chicago Bulls", "Cleveland Cavaliers", "Dallas Mavericks", "Denver Nuggets",
        "Detroit Pistons", "Golden State Warriors", "Houston Rockets", "Indiana Pacers",
        "LA Clippers", "Los Angeles Lakers", "Memphis Grizzlies", "Miami Heat",
        "Milwaukee Bucks", "Minnesota Timberwolves", "New Orleans Pelicans", "New York Knicks",
        "Oklahoma City Thunder", "Orlando Magic", "Philadelphia 76ers", "Phoenix Suns",
        "Portland Trail Blazers", "Sacramento Kings", "San Antonio Spurs", "Toronto Raptors",
        "Utah Jazz", "Washington Wizards"
    ];

    const UserProfilePicture = ({ base64String, style }) => {
        const defaultStyle = {
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            margin: 'auto',
            display: 'block',
            objectFit: 'cover',
        };
    
        const imageSrc = base64String ? `data:image/jpeg;base64,${base64String}` : 'default.jpg';
        return (
            <img src={imageSrc} alt="User Profile" style={{ ...defaultStyle, ...style }} />
        );
    };

    return (
        <BaseLayout>
            <div className="account-page">
                <div className="user-info-box">
                    <div className="profile-section">
                    {loading ? (
                            <p>Loading profile pic...</p>
                        ) : (
                            <UserProfilePicture
                                base64String={(viewID === '' && authData.user?.profile_picture !== 'large') ? authData.user?.profile_picture : userInfo.profilePicture}
                                style={{
                                    width: '300px',
                                    height: '300px'
                                }}
                            />
                            )}
                            <div>
                                 
                            </div>
                        <div className="profile-details">
                            <p className="info-name">{viewID === '' ? authData.user?.firstName + " " + authData.user?.lastName : userInfo.username}</p>
                            <p className="info-label">Points: {viewID === '' ? authData.user?.score : userInfo.points}</p>
                            <h3 className="info-title">Favorite Teams:</h3>
                            <ul className = "subinfo-title" style={{ listStyleType: 'none', paddingLeft: '0' }}>
                                {((viewID === '' || viewID === authData.user?.id)) && authData.user?.favorite_nfl_team &&(
                                    <>
                                        <li>{authData.user?.favorite_nfl_team} (NFL)</li>
                                    </>
                                )}
                                {((viewID === '' || viewID === authData.user?.id)) && authData.user?.favorite_nba_team &&(
                                    <>
                                        <li>{authData.user?.favorite_nba_team} (NBA)</li>
                                    </>
                                )}
                                {!authData.user?.favorite_nfl_team && !authData.user?.favorite_nba_team && viewID === '' && (
                                    <li>(You have not chosen any favorite teams)</li>
                                )}
                                {!userInfo.favoriteNFLTeam && !userInfo.favoriteNBATeam && viewID !== '' && (
                                    <li>({userInfo.username} has not chosen any favorite teams)</li>
                                )}
                                {(viewID !== '' && viewID !== authData.user?.id) && userInfo.favoriteNFLTeam &&(
                                    <>
                                        <li>{userInfo.favoriteNFLTeam} (NFL)</li>
                                    </>
                                )}
                                {(viewID !== '' && viewID !== authData.user?.id) && userInfo.favoriteNBATeam &&(
                                    <>
                                        <li>{userInfo.favoriteNBATeam} (NBA)</li>
                                    </>
                                )}
                            </ul>
                            {/* Add other account-specific information here */}
                        </div>
                    </div>

                    {viewID === '' && (
                        <div className="actions-wrapper" style={{ display: 'flex', justifyContent: 'center' }}>
                            <div className="actions">
                                <div style={{ display: 'flex', flexDirection: 'column'}}>
                                    <div className="profile-picture-upload" style={{ marginBottom: '20px', width: '300px' }}>
                                    {profilePicError && (
                                        <div className="alert alert-danger" role="alert">
                                            {profilePicError}
                                        </div>
                                    )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            id="profile-picture-input"
                                            onChange={(e) => handleProfilePictureChange(e)}
                                            style={{ display: 'none' }} // Hide the file input
                                        />

                                        <label htmlFor="profile-picture-input" className="file-button">Change Profile Picture</label>
                                    </div>
                                    <select className="file-button" onChange={handleSelectFavoriteNFLTeam}
                                            style={{ marginBottom: '20px', width: '300px' }} value={userInfo.favoriteNFLTeam}>
                                        <option value="" disabled>Select Favorite NFL Team</option>
                                        {nflTeams.map(team => (
                                            <option key={team} value={team}>{team}</option>
                                        ))}
                                    </select>
                                    <select className="file-button" onChange={handleSelectFavoriteNBATeam}
                                            style={{ marginBottom: '20px', width: '300px' }} value={userInfo.favoriteNBATeam}>
                                        <option value="" disabled>Select Favorite NBA Team</option>
                                        {nbaTeams.map(team => (
                                            <option key={team} value={team}>{team}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </BaseLayout>
    );
};

export default AccountPage;