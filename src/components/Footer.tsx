export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-gray-600">
            © 2024 Abid. Fully made with AI (without even touching a single line of code)
          </div>
          <div className="flex items-center">
            <a 
              href="https://www.buymeacoffee.com/abid_hasan112"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform hover:scale-105"
            >
              <img 
                src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=abid_hasan112&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" 
                alt="Buy Me A Coffee"
                className="h-10"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
