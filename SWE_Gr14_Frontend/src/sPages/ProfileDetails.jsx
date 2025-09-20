import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../cstyles/ProfileDetails.scss";

function ProfileDetails() {
  const navigate = useNavigate();
  const [proflie, setProfile] = useState({
    email: '',
    age: '',
    first_name: '',
    last_name: '',
    gender: '',
    phone_number: '',
    pic: null
  });
  const handleProfileChange = (e) => {
    const { name, value, files } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userData = JSON.parse(localStorage.getItem('user_data'));
    if (!userData?.user_id) {
      alert("User not logged in.");
      return;
    }
    const payload = {
      user_id: userData.user_id,
      email: userData.email,
      // delivery: true, // hardcoded; replace with checkbox later if needed
      first_name: proflie.first_name,
      last_name: proflie.last_name,
      age: parseInt(proflie.age),
      gender: proflie.gender,
      pic: "default.jpg", // Placeholder; replace with actual file handling if needed
      phone_number: proflie.phone_number,
    };
    console.log('Submitting:', payload);

    try {
      const response = await fetch('http://localhost:8000/s_add_profile', { // corrected endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log('Response:', result);
      if (result.success) {
        alert('Profile details added successfully!');
        navigate('/ShopDetails');
      } else {
        alert(result.error || 'Failed to add product.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while adding the product.');
    }
  };

  return (
    <div className="add-product-container">
      <div className="form-wrapper">

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-section">
            <h3>Profile Details</h3>
            <div className="row">
              <input type="text" name="first_name" placeholder="First Name" value={proflie.first_name} onChange={handleProfileChange} required />
              <input type="text" name="last_name" placeholder="Last Name" value={proflie.last_name} onChange={handleProfileChange} required />
            </div>
            <div className="row">
              <input type="number" name="age" placeholder="Age" value={proflie.age} onChange={handleProfileChange} required />
              <select name="gender" value={proflie.gender} onChange={handleProfileChange} required>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="row">
              <input type="tel" name="phone_number" placeholder="Phone Number" value={proflie.phone_number} onChange={handleProfileChange} required />
            </div>
            <div className="row">
              <input type="file" name="pic" accept="image/*" onChange={handleProfileChange} />
            </div>
          </div>

          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
  
}

export default ProfileDetails;
