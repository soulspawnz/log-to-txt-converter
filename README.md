# Log to TXT Converter

Log to TXT Converter is a web-based tool that allows users to easily convert .log files to .txt format. Built with Next.js and React, this application provides a simple and intuitive interface for uploading log files, converting them, and downloading the results.

## Features

- Upload multiple .log files simultaneously
- Convert .log files to .txt format
- Download individual converted files
- Download all converted files as a zip archive
- Responsive design for use on various devices

## Getting Started

### Prerequisites

- Node.js (version 14 or later)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/log-to-txt-converter.git
   ```

2. Navigate to the project directory:

   ```bash
   cd log-to-txt-converter
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

   or

   ```bash
   yarn install
   ```

### Running the Development Server

To start the development server, run:

```bash
npm run dev
```

or

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1. Open the application in your web browser.
2. Click on the "Upload .log files" input or drag and drop your .log files onto it.
3. Select one or more .log files to upload.
4. The files will be automatically converted to .txt format.
5. Once converted, you can download individual files by clicking the "Download" button next to each file name.
6. To download all converted files at once, click the "Download All" button.

## Project Structure

log-to-txt-converter/
├── app/
│ ├── api/
│ │ ├── convert/
│ │ │ └── route.ts
│ │ └── download/
│ │ └── route.ts
│ ├── public/
│ │ └── converted/ # This will store the converted .txt files
│ └── page.tsx # Your main page
├── components/
│ └── log-to-txt-converter.tsx
├── utils/
│ └── fileUtils.ts
├── package.json
└── ... # Other configuration files

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework for building the application
- [React](https://reactjs.org/) - JavaScript library for building user interfaces
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework for styling
- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- [Lucide React](https://lucide.dev/) - Icon library

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgments

- Thanks to the Next.js team for providing an excellent framework
- Shadcn for the beautiful UI components
- All contributors and users of this project
