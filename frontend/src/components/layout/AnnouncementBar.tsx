import { Link } from "react-router-dom";
import { Icon } from "../shared/Icon";
export function AnnouncementBar() {
  return (
    <div className="announcement">
      <p>A new perspective on footwear.</p>
      <Link to="/about">
        Meet HEXSHOES <Icon name="arrow" size={13} />
      </Link>
    </div>
  );
}
