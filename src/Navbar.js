import { BsFillArrowUpRightCircleFill } from "react-icons/bs";

const CNavbar = () => {
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <a className="navbar-brand" href="/">
            Ethers with ERC20
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarColor03"
            aria-controls="navbarColor03"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarColor03">
            <ul className="navbar-nav me-auto"></ul>
            <div className="d-flex">
              <a
                href="https://github.com/MidhaTahir/ERC20_with_ethers"
                className="btn btn-secondary my-2 my-sm-0"
              >
                Github <BsFillArrowUpRightCircleFill />
              </a>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default CNavbar;
