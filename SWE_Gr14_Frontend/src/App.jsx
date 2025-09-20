import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Signup from "./cpages/Signup";
import SSignup from "./sPages/Signup";
import Otp from "./cpages/Otp";
import SOtp from "./sPages/Otp";
import SLogin from "./sPages/Login.jsx";
import ShopDetails from "./sPages/ShopDetails";
import RoleSelection from "./cpages/RoleSelection";
import ProfileDetails from "./cpages/ProfileDetails";
import CLogin from "./cpages/Login.jsx";
import Home from "./cpages/Home";
import SHome from "./sPages/Home";
import SReview from "./sPages/Review";
import SFlags from "./sPages/Flags";
import SNotification from "./sPages/Notifications";
import SFollowers from "./sPages/Followers";
import AddProduct from "./cpages/AddProduct";
import Following from "./cpages/Following";
import Review from "./cpages/Review";
import Flags from "./cpages/Flags";
import BrowseShop from "./cpages/BrowseShop";
import ViewProduct from "./cpages/ViewProduct";
import Notification from "./cpages/Notifications";
import Profile from "./cpages/Profile";
import WishList from "./cpages/WishList";
import AddedProducts from "./cpages/AddedProducts";
import EditProduct from "./cpages/EditProduct";
import SProfile from "./sPages/Profile";
import SAddProducts from "./sPages/AddProduct";
import SViewProduct from "./sPages/ViewProduct";
import SEditproduct from "./sPages/EditProduct";
import Start from "./start.jsx";
import "./App.scss";
import Map from "./cpages/Map";
import MapToText from "./cpages/MapToText";
import SProfileDetails from "./sPages/ProfileDetails";

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect the root ("/") path to "/csignup" */}
        <Route path="/" element={<Start />} />

        {/* Route for Signup Page */}
        <Route path="/csignup" element={<Signup />} />

        {/* Route for OTP Page */}
        <Route path="/ssignup" element={<SSignup />} />

        {/* Route for OTP Page */}
        <Route path="/otp" element={<Otp />} />

        {/* Route for Role Selection Page */}
        <Route path="/sotp" element={<SOtp />} />

        {/* Route for Role Selection Page */}
        <Route path="/RoleSelection" element={<RoleSelection />} />

        {/* Route for Profile Details Page */}
        <Route path="/ProfileDetails" element={<ProfileDetails />} />

        {/* Route for Shop Details Page (only for Seller) */}
        <Route path="/ShopDetails" element={<ShopDetails />} />
        <Route path="/wishlist" element={<WishList />} />
        {/* Route for Login Page */}
        <Route path="/clogin" element={<CLogin />} />
        {/* Route for Home Page */}
        <Route path="/Home" element={<Home />} />
        {/* Fallback route for any other paths */}

        <Route path="/AddProduct" element={<AddProduct />} />
        {/* Fallback route for any other paths */}
        <Route path="/Following" element={<Following />} />
        {/* Fallback route for any other paths */}
        <Route path="/Review" element={<Review />} />
        {/* Fallback route for any other paths */}
        <Route path="/Flags" element={<Flags />} />
        {/* Fallback route for any other paths */}
        <Route path="/BrowseShop" element={<BrowseShop />} />
        {/* Fallback route for any other paths */}
        <Route path="/ViewProduct" element={<ViewProduct />} />
        {/* Fallback route for any other paths */}
        <Route path="/Notifications" element={<Notification />} />
        {/* Fallback route for any other paths */}
        <Route path="/Profile" element={<Profile />} />
        {/* Fallback route for any other paths */}
        <Route path="/WishList" element={<WishList />} />
        {/* Fallback route for any other paths */}
        <Route path="/AddedProducts" element={<AddedProducts />} />
        {/* Fallback route for any other paths */}
        <Route path="/EditProduct" element={<EditProduct />} />
        {/* Fallback route for any other paths */}
        <Route path="/sHome" element={<SHome />} />
        {/* Fallback route for any other paths */}
        <Route path="/sFollowers" element={<SFollowers />} />
        {/* Fallback route for any other paths */}
        <Route path="/sReview" element={<SReview />} />
        {/* Fallback route for any other paths */}
        <Route path="/sFlags" element={<SFlags />} />
        {/* Fallback route for any other paths */}
        <Route path="/sNotification" element={<SNotification />} />
        <Route path="/sProfile" element={<SProfile />} />
        <Route path="/sprofiledetails" element={<SProfileDetails />} />
        <Route path="/sAddProduct" element={<SAddProducts />} />
        <Route path="/sViewProduct" element={<SViewProduct />} />

        <Route path="/sEditProduct" element={<SEditproduct />} />

        {/* Fallback route for any other paths */}
        <Route path="/sLogin" element={<SLogin />} />
        {/* Fallback route for any other paths */}
        <Route path="/map" element={<Map />} />
        <Route path="/maptotext" element={<MapToText />} />
        {/* Fallback route for any other paths */}
      </Routes>
    </Router>
  );
}

export default App;
