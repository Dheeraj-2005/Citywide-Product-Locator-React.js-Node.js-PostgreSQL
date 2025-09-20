import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import "../cstyles/Profile.scss";

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    session_id: "",
    email: "",
    first_name: "",
    last_name: "",
    age: "",
    gender: "",
    pic: "default.jpg",
    phone: "",
  });

  const [editMode, setEditMode] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showDeleteProfile, setShowDeleteProfile] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);
  const [deletePassword, setDeletePassword] = useState(""); // State to store the entered password

  useEffect(() => {
    const fetchProfile = async () => {
      const user_id = JSON.parse(localStorage.getItem("user_data"))?.user_id;
      if (!user_id) {
        console.error("No user_id found in localStorage.");
        return;
      }

      try {
        const response = await fetch("http://localhost:8000/c_get_profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id }),
        });

        const data = await response.json();
        console.log("Profile response:", data);

        if (data.success) {
          setProfile({
            session_id: data.profile.session_id,
            email: data.profile.email,
            first_name: data.profile.first_name,
            last_name: data.profile.last_name,
            age: data.profile.age,
            gender: data.profile.gender,
            pic: data.profile.pic || "default.jpg",
            phone: data.profile.phone_number,
          });
        } else {
          console.log("Please finish creating profile");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, []);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const user_id = JSON.parse(localStorage.getItem("user_data")).user_id;

    const payload = {
      user_id,
      first_name: profile.first_name,
      last_name: profile.last_name,
      age: parseInt(profile.age),
      gender: profile.gender,
      phone_number: profile.phone,
      pic: profile.pic,
    };

    try {
      console.log("Payload for profile update:", payload);
      const response = await fetch("http://localhost:8000/c_edit_profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success) {
        alert("Profile updated successfully!");
        setEditMode(false);
      } else {
        alert(data.error || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while updating the profile.");
    }
  };

  const handleForgotPasswordSubmit = () => {
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match!");
      return;
    }
    setPasswordError("");
    setOtpSent(true);
  };

  const handleOTPSubmit = () => {
    console.log(`OTP Verified: ${otp}`);
    setIsPasswordChanged(true);
    setShowForgotPassword(false);
    setOtpSent(false);
    setNewPassword("");
    setConfirmPassword("");
    setOtp("");
  };

  const handleLogout = () => {
    navigate("/clogin");
  };

  const handleDeleteProfile = async () => {
    const user_id = JSON.parse(localStorage.getItem("user_data"))?.user_id;
    if (!user_id) {
      alert("User ID not found. Please log in again.");
      navigate("/clogin");
      return;
    }

    if (!deletePassword) {
      alert("Please enter your password to confirm.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/c_delete_user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id, password: deletePassword }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Profile deleted successfully!");
        localStorage.removeItem("user_data"); // Clear user data from localStorage
        navigate("/clogin"); // Redirect to login page
      } else {
        alert(data.error || "Failed to delete profile.");
      }
    } catch (error) {
      console.error("Error deleting profile:", error);
      alert("An error occurred while deleting the profile.");
    }
  };

  return (
    <div className="profile-container">
      <Header view="profile" setView={() => {}} />

      <div className="profile-content">
        <div className="profile-box">
          <div className="profile-header">
            <h2>Your Profile</h2>
            <button
              className="edit-button"
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          {!editMode ? (
            <div className="profile-details">
              <img
                src={`/${profile.pic}`}
                alt="Profile"
                className="profile-pic"
              />
              <div className="row">
                <p>
                  <strong>First Name:</strong> {profile.first_name}
                </p>
                <p>
                  <strong>Last Name:</strong> {profile.last_name}
                </p>
              </div>
              <div className="row">
                <p>
                  <strong>Age:</strong> {profile.age}
                </p>
                <p>
                  <strong>Gender:</strong> {profile.gender}
                </p>
              </div>
              <div className="row">
                <p>
                  <strong>Phone:</strong> {profile.phone}
                </p>
                <p>
                  <strong>Email:</strong> {profile.email}
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleEditSubmit} className="edit-form">
              <div className="row">
                <input
                  type="text"
                  name="first_name"
                  value={profile.first_name}
                  onChange={handleEditChange}
                  placeholder="First Name"
                />
                <input
                  type="text"
                  name="last_name"
                  value={profile.last_name}
                  onChange={handleEditChange}
                  placeholder="Last Name"
                />
              </div>
              <div className="row">
                <input
                  type="number"
                  name="age"
                  value={profile.age}
                  onChange={handleEditChange}
                  placeholder="Age"
                />
                <select
                  name="gender"
                  value={profile.gender}
                  onChange={handleEditChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="M">M</option>
                  <option value="F">F</option>
                </select>
              </div>
              <div className="row">
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleEditChange}
                  placeholder="Phone"
                />
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleEditChange}
                  placeholder="Email"
                  //   disabled
                />
              </div>
              <button type="submit">Save Changes</button>
            </form>
          )}
        </div>

        <div className="actions-box">
          {!showForgotPassword && !showDeleteProfile && (
            <>
              <button onClick={() => setShowForgotPassword(true)}>
                Forgot Password
              </button>
              <button onClick={() => setShowDeleteProfile(true)}>
                {" "}
                {/* Toggle showDeleteProfile */}
                Delete Profile
              </button>
              <button onClick={handleLogout}>Logout</button>
            </>
          )}

          {showForgotPassword && (
            <div className="action-container">
              {!otpSent ? (
                <>
                  <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  {passwordError && <p className="error">{passwordError}</p>}
                  <button onClick={handleForgotPasswordSubmit}>Send OTP</button>
                </>
              ) : (
                <>
                  <p>OTP has been sent to your email.</p>
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                  <button onClick={handleOTPSubmit}>
                    Verify & Change Password
                  </button>
                </>
              )}
            </div>
          )}

          {showDeleteProfile && (
            <div className="action-container">
              <input
                type="password"
                placeholder="Enter password to confirm"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)} // Update state with entered password
              />
              <button onClick={handleDeleteProfile}>Delete Profile</button>
            </div>
          )}

          {isPasswordChanged && (
            <div className="success-message">
              Password successfully changed!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
