import icon from './ghost';

export default (title: string, content = '') => `<html>
<head>
    <style>
        body {
            width: 100vw;
            height: 100vh;
            margin: 0;
            position: relative;
            font-family: Arial;
            background-color: #11001C;
        }

        body > div {
            margin: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            color: rgba(255, 255, 255, .6);
        }

        svg {
            height: 2rem;
            width: 2rem;
            padding: 1rem;
        }

        svg path {
            fill: rgba(255, 255, 255, .6);
        }

        #contact {
            padding: 1rem;
            text-decoration: none !important;
            color: inherit;
            border: none;
        }
    </style>
</head>
<body>
    <div>
        ${icon}
        <h1>${title}</h1>
        ${content}
        <a id="contact" target="_blank" href="https://spookydoodle.com">spookydoodle.com</a>
    </div>
</body>
</html>`