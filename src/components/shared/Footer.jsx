import { Link } from "react-router-dom";
 
const Footer = () => {
  return (
    <div className="bg-gray-200">
      <div className="px-4 pt-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-7xl md:px-24 lg:px-8">
        <div className="grid row-gap-10 mb-8 lg:grid-cols-6">

          <div className="grid grid-cols-2 gap-5 row-gap-8 lg:col-span-4 md:grid-cols-4">
            
            <div>
              <p className="font-medium tracking-wide text-zinc-950">
                Useful Links
              </p>
              <ul className="mt-2 space-y-2">
                <li>
                  <Link
                    to="/#testimonials"
                    className="text-zinc-950 transition-colors duration-300 hover:text-deep-purple-accent-200"
                  >
                    Testimonials
                  </Link>
                </li>
                <li>
                  <Link
                    to="/#faqs"
                    className="text-zinc-950 transition-colors duration-300 hover:text-deep-purple-accent-200"
                  >
                    FAQs
                  </Link>
                </li>
                <li>
                  <Link
                    to="/#offers"
                    className="text-zinc-950 transition-colors duration-300 hover:text-deep-purple-accent-200"
                  >
                    What We offer
                  </Link>
                </li>
                <li>
                  <Link
                    to="/#benefits"
                    className="text-zinc-950 transition-colors duration-300 hover:text-deep-purple-accent-200"
                  >
                    Our benefits
                  </Link>
                </li>
              </ul>
            </div>


            <div>
              <p className="font-medium tracking-wide text-zinc-950">Legal</p>
              <ul className="mt-2 space-y-2">
                <li>
                  <Link
                    to="/privacy"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                    className="text-zinc-950 transition-colors duration-300 hover:text-deep-purple-accent-200"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                    className="text-zinc-950 transition-colors duration-300 hover:text-deep-purple-accent-200"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                    className="text-zinc-950 transition-colors duration-300 hover:text-deep-purple-accent-200"
                  >
                    About Us
                  </Link>
                </li>
              </ul>
            </div>

          </div>

          <div className="md:max-w-md lg:col-span-2 mt-4 sm-mt-0">
            <span className="text-base font-medium tracking-wide text-zinc-950">
              Subscribe for updates
            </span>
            <form className="flex flex-col mt-4 md:flex-row">
              <input
                placeholder="Email"
                required
                type="text"
                className="grow w-full h-12 px-4 mb-3 transition duration-200 bg-white border border-gray-300 rounded shadow-sm appearance-none md:mr-2 md:mb-0 focus:border-deep-purple-accent-400 focus:outline-none focus:shadow-outline"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center h-12 px-6 font-medium
                tracking-wide text-white transition duration-200 rounded shadow-md 
                bg-black border
                 hover:bg-zinc-700 focus:shadow-outline focus:outline-none"
              >
                Subscribe
              </button>
            </form>
            <p className="mt-4 text-sm text-zinc-950">
              Bacon ipsum dolor amet short ribs pig sausage prosciuto chicken
              spare ribs salami.
            </p>
          </div>


        </div>

        <div className="flex flex-col justify-between pt-5 pb-10 border-t border-gray-800 sm:flex-row">
          <p className="text-sm text-black">
            © Copyright 2020 mexemai. All rights reserved.
          </p>

          <div className="flex items-center gap-2 text-sm text-black">
            <span>Powered by</span>

            <a
              href="https://mexemai.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center"
            >
              <img
                src="/images/mexemailogo.png"
                alt="Mexemai logo"
                width={80}
                height={24}
                className="object-contain cursor-pointer opacity-80 hover:opacity-100 transition"
              />
            </a>

           
          </div>

        
        </div>
      </div>
    </div>
  );
};

export default Footer;
