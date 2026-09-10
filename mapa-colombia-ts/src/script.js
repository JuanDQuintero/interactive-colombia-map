"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var app_1 = require("firebase/app");
var firestore_1 = require("firebase/firestore");
// Configuración de Firebase
var firebaseConfig = {
    apiKey: "tu-api-key",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "tu-messaging-sender-id",
    appId: "tu-app-id"
};
// Inicializar Firebase
var app = (0, app_1.initializeApp)(firebaseConfig);
var db = (0, firestore_1.getFirestore)(app);
// Tus datos actuales
var regionData = {
    "CO-AMA": [
        {
            "id": "parque_amacayacu",
            "name": "Parque Nacional Natural Amacayacu",
            "description": "Corazón de la selva amazónica, ideal para avistar delfines rosados, aves y explorar ecosistemas únicos.",
            "image": "https://media.istockphoto.com/id/1227482854/photo/swamp.webp?a=1&b=1&s=612x612&w=0&k=20&c=iwB1TxNWPXFojFTSQa_9cJS_HgX2VQpV1N_0ZyYlDfE=",
            "category": "Ecoturismo y Aventura"
        }
    ],
    "CO-ANT": [
        {
            "id": "guatape",
            "name": "Piedra del Peñol, Guatapé",
            "description": "Un monolito de 220 metros de altura con vistas espectaculares del embalse.",
            "image": "https://images.unsplash.com/photo-1634602771420-a6314ff9bfc0?q=80&w=2367&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "category": "Aventura"
        },
        {
            "id": "parque_arvi",
            "name": "Parque Arví",
            "description": "Reserva natural y parque ecoturístico con senderos y bosques de niebla.",
            "image": "https://media.istockphoto.com/id/579123364/photo/small-colorful-covered-wooden-bridge-parque-arvi-medellin-colombia.webp?a=1&b=1&s=612x612&w=0&k=20&c=iEcifE8LUIpzd1VictyzFlocEAYIMW1P_Mv37zi8fS0=",
            "category": "Ecoturismo"
        },
        {
            "id": "comuna_13",
            "name": "Comuna 13 con Graffitour",
            "description": "Símbolo de transformación social con arte urbano, escaleras eléctricas y cultura hip hop que muestra la resiliencia de Medellín.",
            "image": "https://tourcomuna13.com/wp-content/uploads/2024/03/tour-comuna-13.jpg",
            "category": "Pueblos y Cultura"
        },
        {
            "id": "jardin",
            "name": "Jardín, Pueblo Patrimonio",
            "description": "Encantador pueblo cafetero con arquitectura colorida, basílica amarilla y cultivos de café de altura.",
            "image": "https://visitarmedellin.com/wp-content/uploads/2024/05/Jardin-Antioquia.jpg",
            "category": "Pueblos y Cultura"
        },
        {
            "id": "santa_fe",
            "name": "Santa Fe de Antioquia",
            "description": "Joyaa colonial con puente de Occidente (monumento nacional), calles empedradas y clima cálido ideal para turismo histórico.",
            "image": "https://www.antioquiacritica.com/wp-content/uploads/2021/03/tour-centro-historico-de-santa-fe-de-antioquia.jpg",
            "category": "Pueblos y Cultura"
        },
        {
            "id": "rio_claro",
            "name": "Reserva Río Claro",
            "description": "Aventura en cañones de mármol con rafting, cuevas y selva tropical virgen para amantes del ecoturismo.",
            "image": "https://rioclaro.co/wp-content/uploads/2019/05/acti016-663x590.jpg",
            "category": "Aventura"
        },
        {
            "id": "parque_explora",
            "name": "Parque Explora",
            "description": "Complejo interactivo con acuario, planetario y más de 300 experiencias científicas para toda la familia.",
            "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Parque_Explora_%28Medell%C3%ADn%2C_Colombia%29.JPG/1200px-Parque_Explora_%28Medell%C3%ADn%2C_Colombia%29.JPG",
            "category": "Familiar"
        },
        {
            "id": "san_rafael",
            "name": "San Rafael",
            "description": "Paraíso acuático con cascadas, pozos naturales y paisajes selváticos para refrescarse en aguas cristalinas.",
            "image": "https://orienteantioqueno.com/wp-content/uploads/2021/04/cascada-salto-del-indio-san-rafael-antioquia.jpg",
            "category": "Ecoturismo"
        }
    ],
    "CO-ARA": [
        {
            "id": "hato_la_aurora",
            "name": "Hato La Aurora",
            "description": "Reserva natural de los llanos orientales, perfecta para safaris fotográficos y avistamiento de fauna como chigüiros y anacondas.",
            "image": "https://cunaguarotravel.co/wp-content/uploads/2023/11/aurora-capybara.jpg",
            "category": "Ecoturismo y Safari"
        }
    ],
    "CO-ATL": [
        {
            "id": "carnaval_barranquilla",
            "name": "Carnaval de Barranquilla",
            "description": "Una de las fiestas más grandes del mundo, declarada Obra Maestra del Patrimonio Oral e Inmaterial de la Humanidad.",
            "image": "https://media.istockphoto.com/id/1460631679/photo/group-of-people-in-carnival-in-the-streets-of-barranquilla-colombia.webp?a=1&b=1&s=612x612&w=0&k=20&c=K3l1Y-lklVjxEOnkFeJ8c7_cYTSmAb_VLUtgih0K_To=",
            "category": "Cultura y Festivales"
        }
    ],
    "CO-DC": [
        {
            "id": "monserrate",
            "name": "Cerro de Monserrate",
            "description": "Emblemática montaña que ofrece vistas panorámicas de Bogotá y alberga una famosa iglesia.",
            "image": "https://images.unsplash.com/photo-1700526032302-56d9d4f1fafd?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8TW9uc2VycmF0ZSUyMGNvbG9tYmlhfGVufDB8fDB8fHww",
            "category": "Miradores y Cultura"
        },
        {
            "id": "chorro_quevedo",
            "name": "Plazoleta del Chorro de Quevedo",
            "description": "Corazón histórico de Bogotá, rodeado de calles coloniales, arte y cafés.",
            "image": "https://media.istockphoto.com/id/1733445306/photo/plaque-of-the-famous-chorro-de-quevedo-the-location-where-gonzalo-jimenez-de-quesada-first.webp?a=1&b=1&s=612x612&w=0&k=20&c=jpR1KGjKg4BAUFcpNPf7HNqQuOKXUErc3NILMMXTzf4=",
            "category": "Cultura e Historia"
        }
    ],
    "CO-BOL": [
        {
            "id": "ciudad_amurallada",
            "name": "Ciudad Amurallada, Cartagena",
            "description": "El centro histórico de Cartagena, con calles coloridas y arquitectura colonial.",
            "image": "https://media.istockphoto.com/id/2178382297/photo/beautiful-aerial-view-of-the-walled-city-of-cartagena-its-majestic-cathedral-the-plaza-its.webp?a=1&b=1&s=612x612&w=0&k=20&c=j9jLF2RxLwmBcaOTyT2vMRjH8GCngc5WzXnOzkgV-Eo=",
            "category": "Cultura e Historia"
        },
        {
            "id": "islas_rosario",
            "name": "Islas del Rosario",
            "description": "Archipiélago caribeño con aguas cristalinas, arrecifes de coral y playas de arena blanca.",
            "image": "https://media.istockphoto.com/id/1180424475/photo/image-of-the-rosario-islands-its-an-archipelago-comprising-27-islands-located-about-two-hours.webp?a=1&b=1&s=612x612&w=0&k=20&c=F5UEIPWS51nZF-ojxm-bYpgklp56RqHAHxj0Pl6WczY=",
            "category": "Naturaleza y Playas"
        }
    ],
    "CO-BOY": [
        {
            "id": "villa_de_leyva",
            "name": "Villa de Leyva",
            "description": "Pueblo patrimonio con una de las plazas más grandes de América y calles empedradas.",
            "image": "https://media.istockphoto.com/id/1159304987/photo/villa-de-leyva-colombia-church-on-the-cobblestoned-plaza-mayor-of-the-historic-16th-century.webp?a=1&b=1&s=612x612&w=0&k=20&c=rnUU9ZRKtGq1zMWJYSEhj6Pyw95gG18Ik5Oe4jnf6xM=",
            "category": "Pueblos y Cultura"
        },
        {
            "id": "laguna_tota",
            "name": "Laguna de Tota",
            "description": "El lago más grande de Colombia, con playas de arena blanca y paisajes andinos únicos.",
            "image": "https://media.istockphoto.com/id/659311650/photo/laguna-de-tota.webp?a=1&b=1&s=612x612&w=0&k=20&c=DliNBEGufoAwU_hl-p2Cj6nXNW7HQRxQvSAWSRmFExo=",
            "category": "Naturaleza y Aventura"
        }
    ],
    "CO-CAL": [
        {
            "id": "nevado_del_ruiz",
            "name": "Nevado del Ruiz",
            "description": "Volcán activo cubierto de glaciares, parte del Parque Nacional Natural Los Nevados.",
            "image": "https://media.istockphoto.com/id/499097079/photo/snow-tip.webp?a=1&b=1&s=612x612&w=0&k=20&c=tKX_ad7vk-rt0aGdCcS45J9wyQBdkCodG2Pjj-d2ooc=",
            "category": "Naturaleza y Aventura"
        },
        {
            "id": "catedral_manizales",
            "name": "Catedral Basílica de Manizales",
            "description": "Impresionante catedral neogótica con un corredor polaco que ofrece vistas de 360° de la ciudad.",
            "image": "https://upload.wikimedia.org/wikipedia/commons/0/09/2007-06-12_catedral_de_manizales-pablo_andres_toro_arias.jpg",
            "category": "Cultura y Arquitectura"
        }
    ],
    "CO-CAQ": [
        {
            "id": "canon_guejar",
            "name": "Cañón del Río Güejar",
            "description": "Un destino emergente para el ecoturismo, con cascadas, formaciones rocosas y rafting.",
            "image": "https://maravillasdelguejar.com/wp-content/uploads/2025/01/Guia-completa-para-visitar-el-canon-del-Guejar-en-Colombia.jpg",
            "category": "Ecoturismo y Aventura"
        }
    ],
    "CO-CAS": [
        {
            "id": "hato_la_aurora_casanare",
            "name": "Hato La Aurora",
            "description": "Experimenta la cultura llanera y la biodiversidad en esta inmensa reserva natural.",
            "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-Otb4-TpYKV3Uf5BbuLTUkYasbtDS7irYMA&s",
            "category": "Ecoturismo y Safari"
        }
    ],
    "CO-CAU": [
        {
            "id": "parque_purace",
            "name": "Parque Nacional Natural Puracé",
            "description": "Hogar del Cóndor de los Andes y el nacimiento de los principales ríos de Colombia.",
            "image": "https://lh6.googleusercontent.com/proxy/ebXP2xle14MwcEew6mlu9b5IkclmiIjgCySkIE3NhkdcjE9Gck8aEBhj9gzfP4WljieGoFQoIKXQUWaTogN0dA",
            "category": "Ecoturismo"
        },
        {
            "id": "popayan",
            "name": "Popayán, la Ciudad Blanca",
            "description": "Centro histórico famoso por su arquitectura colonial blanca y sus celebraciones de Semana Santa.",
            "image": "https://media.traveler.es/photos/61376f8bd4923f67e298ef5b/master/w_1600%2Cc_limit/130738.jpg",
            "category": "Cultura e Historia"
        }
    ],
    "CO-CES": [
        {
            "id": "festival_vallenato",
            "name": "Festival de la Leyenda Vallenata",
            "description": "El evento más importante del folclor vallenato, celebrado anualmente en Valledupar.",
            "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqjlKtlstQiWgQyZDZihZNl5Gryv4ZMK1_Fw&s",
            "category": "Cultura y Festivales"
        }
    ],
    "CO-CHO": [
        {
            "id": "nuqui",
            "name": "Nuquí",
            "description": "Destino en el Pacífico para el avistamiento de ballenas jorobadas, surf y conexión con la naturaleza.",
            "image": "https://aventurecolombia.com/wp-content/uploads/2021/04/Nuqui-Choco-Pacifique-%C2%A9anonimo.jpg",
            "category": "Ecoturismo y Aventura"
        }
    ],
    "CO-COR": [
        {
            "id": "cienaga_ayapel",
            "name": "Ciénaga de Ayapel",
            "description": "Complejo cenagoso de gran biodiversidad, ideal para la pesca deportiva y la observación de aves.",
            "image": "https://natura.org.co/wp-content/uploads/2022/08/Juntos-por-la-conservacion-de-la-cienaga-de-Ayapel-magdalena-cauca-vive-fundacion-natura-5.png",
            "category": "Ecoturismo"
        }
    ],
    "CO-CUN": [
        {
            "id": "catedral_sal",
            "name": "Catedral de Sal de Zipaquirá",
            "description": "Una iglesia subterránea construida dentro de las minas de sal, una maravilla arquitectónica.",
            "image": "https://www.lavanguardia.com/files/og_thumbnail/uploads/2019/01/04/5fa51ae8290ab.jpeg",
            "category": "Arquitectura y Cultura"
        },
        {
            "id": "laguna_guatavita",
            "name": "Laguna de Guatavita",
            "description": "Laguna sagrada de la cultura Muisca, famosa por la leyenda de El Dorado.",
            "image": "https://lh3.googleusercontent.com/proxy/ySg-GFOZGVW-Tf1cR_6j-ohLhHPOcohbQO2C4vmm0ngnJW0q2eWrDDyquutqdfO2j6ttZ7ddjLGc5QnOyCduzuNhCA",
            "category": "Historia y Naturaleza"
        }
    ],
    "CO-GUA": [
        {
            "id": "cerros_mavecure",
            "name": "Cerros de Mavecure",
            "description": "Tres monolitos imponentes que se elevan sobre la selva amazónica, un lugar sagrado y de belleza única.",
            "image": "https://upload.wikimedia.org/wikipedia/commons/2/2b/CERRO_EL_MICO_Y_PAJARO_DESDE_MAVECURE_CON_EL_RIO_INIRIDA.jpg",
            "category": "Naturaleza y Aventura"
        }
    ],
    "CO-GUV": [
        {
            "id": "pinturas_rupestres_cerro_azul",
            "name": "Pinturas Rupestres de Cerro Azul",
            "description": "Murales de arte rupestre de miles de años de antigüedad que representan la vida prehistórica en la Amazonía.",
            "image": "https://s.france24.com/media/display/a0cc015c-38ec-11eb-b297-005056bf87d6/w:1280/p:16x9/serrania.jpg",
            "category": "Arqueología e Historia"
        }
    ],
    "CO-HUI": [
        {
            "id": "desierto_tatacoa",
            "name": "Desierto de la Tatacoa",
            "description": "Bosque seco tropical con paisajes erosionados de tonos ocres y grises, ideal para la astronomía.",
            "image": "https://aventurecolombia.com/wp-content/uploads/2021/03/Desert-de-Tatacoa-%C2%A9-tristan-quevilly.jpg",
            "category": "Naturaleza y Aventura"
        },
        {
            "id": "san_agustin",
            "name": "Parque Arqueológico de San Agustín",
            "description": "La necrópolis más grande del mundo, con cientos de estatuas monolíticas precolombinas.",
            "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/San_Agustin_parque_arqueologic.jpg/330px-San_Agustin_parque_arqueologic.jpg",
            "category": "Arqueología e Historia"
        }
    ],
    "CO-LAG": [
        {
            "id": "cabo_de_la_vela",
            "name": "Cabo de la Vela",
            "description": "Paisaje desértico que se encuentra con el mar Caribe, sagrado para el pueblo Wayúu.",
            "image": "https://media.istockphoto.com/id/1445577721/photo/guajira-riohacha-colombia-march-4-2020-cabo-de-la-vela-sugar-pylon.webp?a=1&b=1&s=612x612&w=0&k=20&c=qcaqFXUpBDEfz6a85SWWkf3BW8o9USdBCgzzxbW6SWA=",
            "category": "Naturaleza y Cultura"
        },
        {
            "id": "punta_gallinas",
            "name": "Punta Gallinas",
            "description": "El punto más septentrional de América del Sur, con dunas de arena que se sumergen en el mar.",
            "image": "https://media.istockphoto.com/id/517255323/photo/flock-of-flamingos.webp?a=1&b=1&s=612x612&w=0&k=20&c=s9Jl60hySgAKH-kg58Rolen5B2bp4xeAnFJW10x1Bns=",
            "category": "Naturaleza y Aventura"
        }
    ],
    "CO-MAG": [
        {
            "id": "parque_tayrona",
            "name": "Parque Nacional Natural Tayrona",
            "description": "Playas paradisíacas que se encuentran con la selva al pie de la Sierra Nevada.",
            "image": "https://upload.wikimedia.org/wikipedia/commons/7/76/Cabo_San_Juan%2C_Colombia.jpg",
            "category": "Ecoturismo y Playas"
        },
        {
            "id": "ciudad_perdida",
            "name": "Ciudad Perdida (Teyuna)",
            "description": "Antiguo poblado indígena Tayrona en la Sierra Nevada, accesible tras una caminata de varios días.",
            "image": "https://content-historia.nationalgeographic.com.es/medio/2023/07/26/istock-660359522_1f2d9111_230726103810_1280x873.jpg",
            "category": "Arqueología y Aventura"
        }
    ],
    "CO-MET": [
        {
            "id": "cano_cristales",
            "name": "Caño Cristales",
            "description": "Conocido como 'el río de los cinco colores', un espectáculo natural único en el mundo.",
            "image": "https://upload.wikimedia.org/wikipedia/commons/d/db/CA%C3%91O_CRISTALES%2C_EL_R%C3%8DO_DE_COLORES.jpg",
            "category": "Naturaleza y Ecoturismo"
        }
    ],
    "CO-NAR": [
        {
            "id": "santuario_lajas",
            "name": "Santuario de Las Lajas",
            "description": "Una impresionante iglesia de estilo gótico construida en el cañón del río Guáitara.",
            "image": "https://upload.wikimedia.org/wikipedia/commons/a/a3/Santuario_de_Las_Lajas%2C_Ipiales%2C_Colombia%2C_2015-07-21%2C_DD_21-23_HDR.jpg",
            "category": "Cultura y Arquitectura"
        },
        {
            "id": "laguna_cocha",
            "name": "Laguna de la Cocha",
            "description": "Gran embalse de origen glacial con una isla-santuario de flora y fauna.",
            "image": "https://static.roadtrip.travel/media/roadtrips/descubre-la-naturaleza-pasadia-unico-en-la-laguna-de-la-cocha-1200-c0d26f9.jpg",
            "category": "Naturaleza y Ecoturismo"
        }
    ],
    "CO-NSA": [
        {
            "id": "playa_de_belen",
            "name": "Los Estoraques, Playa de Belén",
            "description": "Área natural única con formaciones rocosas erosionadas que parecen columnas gigantes.",
            "image": "https://lh5.googleusercontent.com/proxy/PSMhjmlMwEZrI-j3-rVbw62yqBKukjVXP7F1kzYxe5X0KZF-IN9asbkQgbJjc-jPgDfc2vqLBp3-t4kZdELEPiYDkGo",
            "category": "Naturaleza y Pueblos"
        }
    ],
    "CO-PUT": [
        {
            "id": "fin_del_mundo",
            "name": "Cascada Fin del Mundo",
            "description": "Una serie de cascadas y pozos naturales en medio de la selva amazónica, un paraíso para el ecoturismo.",
            "image": "https://www.ecoturismoputumayo.com/images/atractivos/4/cascadas-fin-del-mundo-6.jpg",
            "category": "Ecoturismo y Aventura"
        }
    ],
    "CO-QUI": [
        {
            "id": "valle_cocora",
            "name": "Valle de Cocora, Salento",
            "description": "Hogar de la palma de cera, el árbol nacional de Colombia, en un paisaje montañoso espectacular.",
            "image": "https://cdn-ilcfjhh.nitrocdn.com/AMsOVcaxJEBiDUJmLghgteLoXmGyZJhB/assets/images/optimized/rev-fa623dd/cartagena-tours.co/wp-content/uploads/2022/12/2022110906163046516.jpg",
            "category": "Ecoturismo"
        },
        {
            "id": "salento",
            "name": "Salento",
            "description": "Pueblo cafetero colorido y tradicional, punto de partida para explorar el Eje Cafetero.",
            "image": "https://a.storyblok.com/f/95452/7360x4912/51747b828d/colombia-salento.jpg",
            "category": "Pueblos y Cultura"
        }
    ],
    "CO-RIS": [
        {
            "id": "termales_santa_rosa",
            "name": "Termales de Santa Rosa de Cabal",
            "description": "Famosas aguas termales y cascadas en un entorno natural exuberante.",
            "image": "https://upload.wikimedia.org/wikipedia/commons/e/ed/Termales_Santa_Rosa_de_Cabal.jpg",
            "category": "Bienestar y Naturaleza"
        }
    ],
    "CO-SAP": [
        {
            "id": "cayo_acuario",
            "name": "Cayo Acuario, San Andrés",
            "description": "Un pequeño cayo de arena blanca rodeado de aguas cristalinas, ideal para snorkel.",
            "image": "https://sanandres.travel/uploads/0000/2/2022/10/14/acuario-san-andres4.jpg",
            "category": "Playas y Snorkel"
        }
    ],
    "CO-SAN": [
        {
            "id": "barichara",
            "name": "Barichara",
            "description": "Considerado el 'pueblito más lindo de Colombia', famoso por su arquitectura colonial.",
            "image": "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/27/a5/cd/19/caption.jpg?w=1200&h=1200&s=1",
            "category": "Pueblos y Cultura"
        },
        {
            "id": "canon_chicamocha",
            "name": "Cañón del Chicamocha",
            "description": "Uno de los cañones más grandes del mundo, con un parque temático y un teleférico impresionante.",
            "image": "https://cotelcosantander.org/wp-content/uploads/2022/07/canon_chicamocha_desde_panachi.jpg",
            "category": "Naturaleza y Aventura"
        }
    ],
    "CO-SUC": [
        {
            "id": "tolu_covenas",
            "name": "Tolú y Coveñas",
            "description": "Destinos costeros en el Golfo de Morrosquillo, conocidos por sus playas tranquilas y gastronomía.",
            "image": "https://www.comfenalco.com.co/wp-content/uploads/2024/05/tolu-covenas.webp",
            "category": "Playas y Gastronomía"
        }
    ],
    "CO-TOL": [
        {
            "id": "parque_los_nevados",
            "name": "Parque Nacional Natural Los Nevados",
            "description": "Un ecosistema de páramo y glaciares con picos volcánicos como el Nevado del Tolima.",
            "image": "https://old.parquesnacionales.gov.co/portal/wp-content/uploads/2016/06/Centro_de_visitantes_el_cisne_Luis_Alfonso_Cano.jpg",
            "category": "Naturaleza y Montañismo"
        }
    ],
    "CO-VAC": [
        {
            "id": "cristo_rey_cali",
            "name": "Cristo Rey, Cali",
            "description": "Monumento icónico con vistas panorámicas de la ciudad de Cali, la capital de la salsa.",
            "image": "https://cloudfront-us-east-1.images.arcpublishing.com/elespectador/UXO3W2SZMRFUFDL3K7F3DSMFIQ.jpg",
            "category": "Miradores y Cultura"
        },
        {
            "id": "lago_calima",
            "name": "Lago Calima",
            "description": "Embalse famoso por sus fuertes vientos, ideal para la práctica de deportes acuáticos como kitesurf.",
            "image": "https://lh4.googleusercontent.com/proxy/kQWhLZriOy35aSODsRZT_QO7vSkBAj3eHdyGzMlN9RUAng9DAZrhHmjdBhnMuZ8L1ztKIjM5y69mplZcaazcpg",
            "category": "Naturaleza y Aventura"
        }
    ],
    "CO-VAU": [
        {
            "id": "raudal_jirijirimo",
            "name": "Raudal del Jirijirimo",
            "description": "Impresionante raudal en el río Apaporis, considerado uno de los lugares más bellos y remotos de la Amazonía.",
            "image": "https://lh4.googleusercontent.com/proxy/ZwnsEJYuHDw7wxbCO3Qea9ZmKcRtasgX5H4hyc8t0YXeWt5_Bt06o611UIRNxi05Gnsg9IwHitbfYs1RtnQ",
            "category": "Naturaleza y Aventura"
        }
    ],
    "CO-VIC": [
        {
            "id": "parque_tuparro",
            "name": "Parque Nacional Natural El Tuparro",
            "description": "Reserva de la Biósfera con vastas sabanas, ríos y formaciones rocosas únicas (tepuyes).",
            "image": "https://old.parquesnacionales.gov.co/portal/wp-content/uploads/2013/08/WhatsApp-Image-2019-04-30-at-2.11.11-PM-2.jpeg",
            "category": "Ecoturismo y Aventura"
        }
    ]
};
// Función para migrar datos
function migrateToFirestore() {
    return __awaiter(this, void 0, void 0, function () {
        var batch, _loop_1, _i, _a, _b, regionCode, attractions, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    batch = (0, firestore_1.writeBatch)(db);
                    _loop_1 = function (regionCode, attractions) {
                        // Crear documento de región
                        var regionRef = (0, firestore_1.doc)(db, 'regions', regionCode);
                        batch.set(regionRef, {
                            name: getRegionName(regionCode), // Necesitarás implementar esta función
                            lastUpdated: new Date()
                        });
                        // Crear subcolección de atracciones
                        attractions.forEach(function (attraction) {
                            var attractionRef = (0, firestore_1.doc)((0, firestore_1.collection)(regionRef, 'attractions'), attraction.id);
                            batch.set(attractionRef, __assign(__assign({}, attraction), { createdAt: new Date() }));
                        });
                    };
                    // Iterar sobre cada región
                    for (_i = 0, _a = Object.entries(regionData); _i < _a.length; _i++) {
                        _b = _a[_i], regionCode = _b[0], attractions = _b[1];
                        _loop_1(regionCode, attractions);
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, batch.commit()];
                case 2:
                    _c.sent();
                    console.log('Migración completada exitosamente!');
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _c.sent();
                    console.error('Error en la migración:', error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Ejecutar migración
migrateToFirestore();
function getRegionName(regionCode) {
    var regionNames = {
        "CO-AMA": "Amazonas",
        "CO-ANT": "Antioquia",
        "CO-ARA": "Arauca",
        "CO-ATL": "Atlántico",
        "CO-DC": "Bogotá D.C.",
        "CO-BOL": "Bolívar",
        "CO-BOY": "Boyacá",
        "CO-CAL": "Caldas",
        "CO-CAQ": "Caquetá",
        "CO-CAS": "Casanare",
        "CO-CAU": "Cauca",
        "CO-CES": "Cesar",
        "CO-CHO": "Chocó",
        "CO-COR": "Córdoba",
        "CO-CUN": "Cundinamarca",
        "CO-GUA": "Guainía",
        "CO-GUV": "Guaviare",
        "CO-HUI": "Huila",
        "CO-LAG": "La Guajira",
        "CO-MAG": "Magdalena",
        "CO-MET": "Meta",
        "CO-NAR": "Nariño",
        "CO-NSA": "Norte de Santander",
        "CO-PUT": "Putumayo",
        "CO-QUI": "Quindío",
        "CO-RIS": "Risaralda",
        "CO-SAP": "San Andrés y Providencia",
        "CO-SAN": "Santander",
        "CO-SUC": "Sucre",
        "CO-TOL": "Tolima",
        "CO-VAC": "Valle del Cauca",
        "CO-VAU": "Vaupés",
        "CO-VIC": "Vichada"
    };
    return regionNames[regionCode] || regionCode;
}
