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

        .content {
            text-align: center;
        }

        svg {
            height: 32px;
            width: 32px;
            padding: 16px;
        }

        svg path {
            fill: rgba(255, 255, 255, .6);
        }

        #contact {
            padding: 16px;
            text-decoration: none !important;
            color: inherit;
            border: none;
        }
    </style>
</head>
<body>
    <div>
        ${icon}
        <div class="content">
            <h1>${title}</h1>
            ${content}
        </div>
        <a id="contact" target="_blank" href="https://spookydoodle.com">spookydoodle.com</a>
    </div>
</body>
</html>`