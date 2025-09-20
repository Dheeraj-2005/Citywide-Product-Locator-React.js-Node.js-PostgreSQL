import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Signup from "./cpages/Signup";
import Otp from "./cpages/Otp";
import RoleSelection from "./cpages/RoleSelection";
import ProfileDetails from "./cpages/ProfileDetails";
import ShopDetails from "./cpages/ShopDetails";
import Login from "./cpages/clogin";
import Home from "./cpages/Home";
import AddProduct from "./cpages/AddProduct";
import Following from "./cpages/Following";
import Review from "./cpages/Review";
import Falgs from "./cpages/Flags";
import BrowseShop from "./cpages/BrowseShop";
import ViewProduct from "./cpages/ViewProduct";
import Notification from "./cpages/Notifications";
import Profile from "./cpages/Profile";
import WishList from "./cpages/WishList";
import AddedProducts from "./cpages/AddedProducts";
import EditProduct from "./cpages/EditProduct";
import Start from "./start.jsx";
import "./App.scss";

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect the root ("/") path to "/csignup" */}
        <Route path="/" element={<Start />} />

        {/* Route for Signup Page */}
        <Route path="/csignup" element={<Signup />} />

        {/* Route for OTP Page */}
        <Route path="/otp" element={<Otp />} />

        {/* Route for Role Selection Page */}
        <Route path="/RoleSelection" element={<RoleSelection />} />

        {/* Route for Profile Details Page */}
        <Route path="/ProfileDetails" element={<ProfileDetails />} />

        {/* Route for Shop Details Page (only for Seller) */}
        <Route path="/ShopDetails" element={<ShopDetails />} />
        {/* Route for Login Page */}
        <Route path="/clogin" element={<Login />} />
        {/* Route for Home Page */}
        <Route path="/Home" element={<Home />} />
        {/* Fallback route for any other paths */}

        <Route path="/AddProduct" element={<AddProduct />} />
        {/* Fallback route for any other paths */}
        <Route path="/Following" element={<Following />} />
        {/* Fallback route for any other paths */}
        <Route path="/Review" element={<Review />} />
        {/* Fallback route for any other paths */}
        <Route path="/Flags" element={<Falgs />} />
        {/* Fallback route for any other paths */}
        <Route path="/BrowseShop" element={<BrowseShop />} />
        {/* Fallback route for any other paths */}
        <Route path="/ViewProduct/" element={<ViewProduct />} />
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
      </Routes>
    </Router>
  );
}

export default App;
