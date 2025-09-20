import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import '../sStyles/Following.scss';

function Following() {
    const [view, setView] = useState('followers');
    const navigate = useNavigate();

    // List of followers with details like email, name, age, gender, and pic
    const [followers, setFollowers] = useState([
        {
            email: 'user1@example.com',
            first_name: 'John',
            last_name: 'Doe',
            age: 28,
            gender: 'Male',
            pic: 'profile1.jpg',
        },
        {
            email: 'user2@example.com',
            first_name: 'Jane',
            last_name: 'Smith',
            age: 24,
            gender: 'Female',
            pic: 'profile2.jpg',
        },
    ]);

    // Function to remove a follower by their email
    const handleRemoveFollower = (email) => {
        setFollowers(followers.filter(follower => follower.email !== email));
    };

    return (
        <>
            <Header view={view} setView={setView} />

            <div className="Following-container">

                <div className="suggestions">
                    {view === 'followers' &&
                        followers.map((follower, index) => (
                            <div key={index} className="suggestion-card">
                                <div className="follower-top-row">
                                    <div className="follower-info">
                                        <img src={follower.pic} alt={`${follower.first_name} ${follower.last_name}`} className="follower-pic" />
                                        <div>
                                            <strong>{`${follower.first_name} ${follower.last_name}`}</strong>
                                            <div>{follower.email}</div>
                                            <div>Age: {follower.age} | Gender: {follower.gender}</div>
                                        </div>
                                    </div>
                                    <button
                                        className="remove-follower-btn"
                                        onClick={() => handleRemoveFollower(follower.email)}
                                    >
                                        Remove Follower
                                    </button>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </>
    );
}

export default Following;
