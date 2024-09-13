const { formatDuration } = require('../../lib/func.js');

const cooldown = 3 * 60 * 1000;

exports.cmd = {
    name: ['work'],
    command: ['work'],
    category: ['economy'],
    detail: {
        desc: 'Realiza una acción de trabajo para ganar dinero.'
    },
    setting: {
        isRegister: true,
        isGroup: true
    },
    async start({ msg, db }) {
        const group = db.groups.get(msg.from);
        const user = group.users.get(msg.sender);

        const now = Date.now();
        if (now - user.cooldown.work < cooldown) {
            const timeLeft = formatDuration((user.cooldown.work + cooldown) - now);
            return msg.reply(`🕓〡 *Debes esperar antes de volver a trabajar. Vuelve dentro de*: \`${timeLeft}\``);
        }

        const work = works[Math.floor(Math.random() * works.length)];
        const earnings = Math.floor(Math.random() * (70 - 50 + 1)) + 50;

        user.money += earnings;
        user.cooldown.work = now;
        await db.save();

        await msg.reply(`💼〡${work.replace('%money%', `*${earnings} 🪙 Coins*`)}`);
    }
};

const works = [
    "Trabajaste como guardia de seguridad y descubriste un intento de robo, ganando una bonificación de %money%.",
    "Realizaste trabajo de repartidor y, al completar tus entregas antes de lo previsto, te dieron una propina de %money%.",
    "Trabajaste como chef en un restaurante, y tu plato especial fue un éxito, ganando %money% en recompensas.",
    "Fuiste asistente en un evento y manejaste todo a la perfección, recibiendo un agradecimiento de %money%.",
    "Trabajaste como fotógrafo en una boda y capturaste momentos inolvidables, obteniendo %money% en pago.",
    "Realizaste una tarea como jardinero y transformaste el jardín de una casa, ganando %money% por tu trabajo.",
    "Trabajaste como guía turístico y tus explicaciones cautivaron a todos, ganando %money% en propinas.",
    "Hiciste reparaciones en una casa y arreglaste todo a tiempo, recibiendo un bono de %money%.",
    "Trabajaste como asistente personal y organizaste todo de manera eficiente, ganando %money% como recompensa.",
    "Fuiste conductor de un taxi y tus pasajeros te dejaron una generosa propina de %money% por tu excelente servicio.",
    "Realizaste trabajo como tutor y ayudaste a tus estudiantes a mejorar sus notas, ganando %money% por tus clases.",
    "Trabajaste en un taller de arte y vendiste varias piezas, obteniendo %money% en ganancias.",
    "Fuiste técnico en un concierto y el evento fue un éxito, ganando %money% por tu profesionalismo.",
    "Trabajaste como enfermero y brindaste atención excepcional, ganando %money% en reconocimiento.",
    "Ayudaste en una mudanza y completaste el trabajo en tiempo récord, recibiendo un extra de %money%.",
    "Trabajaste como diseñador gráfico y tu creatividad impresionó a tu cliente, ganando %money% por tu trabajo.",
    "Fuiste entrenador personal y tus clientes lograron sus metas, recibiendo %money% como agradecimiento.",
    "Trabajaste como mecánico y reparaste un auto de lujo, obteniendo %money% por tu destreza.",
    "Fuiste desarrollador freelance y entregaste un proyecto complejo antes del plazo, ganando %money% en bonificaciones.",
    "Trabajaste como organizador de eventos y tu planificación impecable fue muy elogiada, obteniendo %money% por tus servicios.",
    "Fuiste DJ en una fiesta y mantuviste la pista de baile llena toda la noche, ganando %money% en propinas.",
    "Trabajaste como carpintero y creaste muebles a medida que encantaron a tu cliente, obteniendo %money% por tu labor.",
    "Fuiste barista en una cafetería y tus bebidas especiales fueron un éxito, ganando %money% en propinas.",
    "Trabajaste como escritor freelance y tu artículo fue publicado con gran éxito, ganando %money% en regalías.",
    "Fuiste electricista y lograste solucionar un problema complejo en una casa, recibiendo %money% por tu eficiencia.",
    "Trabajaste como pintor y tu mural artístico fue admirado por todos, ganando %money% por tu talento.",
    "Fuiste camarero en un restaurante de lujo y ofreciste un servicio impecable, recibiendo %money% en propinas.",
    "Trabajaste como técnico de informática y arreglaste un sistema crítico, ganando %money% por tu expertise.",
    "Fuiste consultor y tus estrategias mejoraron significativamente las ventas de una empresa, recibiendo %money% en bonificaciones.",
    "Trabajaste como productor de video y tu trabajo fue destacado en varios medios, ganando %money% por tu esfuerzo.",
    "Fuiste cuidador de animales en un refugio, brindando atención excepcional y ganando %money% en agradecimientos.",
    "Trabajaste como estilista y tus cortes de cabello recibieron excelentes críticas, obteniendo %money% en propinas.",
    "Fuiste conductor de un autobús y completaste tu ruta con gran precisión, recibiendo un bono de %money%.",
    "Trabajaste como panadero y tus productos artesanales se vendieron rápidamente, ganando %money% en ventas.",
    "Fuiste guía en un museo y tu conocimiento impresionó a los visitantes, ganando %money% en propinas.",
    "Trabajaste como limpiador profesional y dejaste una oficina impecable, recibiendo %money% como gratificación.",
    "Fuiste programador en una hackathon y tu equipo ganó el primer lugar, obteniendo %money% en premios.",
    "Trabajaste como chofer privado y tus clientes quedaron encantados con tu servicio, recibiendo %money% de propina.",
    "Fuiste carpintero y construiste una estructura personalizada que fue muy valorada, obteniendo %money% por tu trabajo.",
    "Trabajaste como consultor de marketing y ayudaste a una empresa a duplicar sus ventas, ganando %money% en comisiones.",
    "Fuiste chef en un evento privado y tus platos gourmet fueron un éxito, ganando %money% en propinas.",
    "Trabajaste como desarrollador web y creaste un sitio impresionante, obteniendo %money% por tu dedicación.",
    "Fuiste pintor de casas y dejaste una mansión completamente renovada, ganando %money% por tu excelente trabajo.",
    "Trabajaste como organizador de bodas y la ceremonia fue un éxito total, recibiendo %money% en agradecimientos.",
    "Fuiste guardia de un museo y evitaste un intento de robo, obteniendo una recompensa de %money%.",
    "Trabajaste como editor de video y tu montaje fue elogiado por su creatividad, ganando %money% en regalías.",
    "Fuiste diseñador de interiores y transformaste una sala en una obra de arte, ganando %money% por tu trabajo.",
    "Trabajaste como entrenador de fútbol y tu equipo ganó un campeonato, recibiendo una bonificación de %money%.",
    "Fuiste plomero y solucionaste una fuga complicada, ganando %money% por tu habilidad.",
    "Trabajaste como traductor y completaste un proyecto importante, ganando %money% por tu precisión lingüística.",
    "Fuiste agente inmobiliario y cerraste la venta de una propiedad lujosa, ganando %money% en comisiones.",
    "Trabajaste como cerrajero y lograste abrir una puerta complicada, obteniendo %money% por tu destreza.",
    "Fuiste entrenador de mascotas y enseñaste nuevos trucos a un perro, recibiendo %money% en agradecimiento.",
    "Trabajaste como maquillador en una sesión de fotos y tu trabajo fue destacado, ganando %money% en propinas.",
    "Fuiste recolector de basura y trabajaste eficientemente, recibiendo un bono de %money% por tu esfuerzo.",
    "Trabajaste como asistente administrativo y organizaste una oficina caótica, ganando %money% por tu eficiencia.",
    "Fuiste escultor en un parque y tu obra fue admirada por muchos, ganando %money% por tu talento.",
    "Trabajaste como cuidador de plantas y un jardín floreció bajo tu cuidado, ganando %money% por tu dedicación.",
    "Fuiste DJ en un evento privado y tus mezclas mantuvieron a todos bailando, ganando %money% en propinas.",
    "Trabajaste como ingeniero de sonido en un concierto y el audio fue impecable, ganando %money% por tu profesionalismo.",
    "Fuiste piloto de drones en una grabación y capturaste imágenes espectaculares, ganando %money% por tu precisión.",
    "Trabajaste como joyero y diseñaste una pieza exclusiva, ganando %money% en ventas.",
    "Fuiste actor en una obra de teatro y tu actuación fue aplaudida por el público, recibiendo %money% en honorarios.",
    "Trabajaste como guardaparques y ayudaste a preservar el ecosistema, recibiendo una bonificación de %money%.",
    "Fuiste técnico de luces en un espectáculo y creaste una atmósfera impresionante, ganando %money% por tu creatividad.",
    "Trabajaste como chef de comida rápida y manejaste la cocina de manera eficiente, ganando %money% en bonificaciones.",
    "Fuiste masajista en un spa de lujo y tus clientes quedaron relajados, recibiendo %money% en propinas.",
    "Trabajaste como animador en una fiesta infantil y mantuviste a todos entretenidos, ganando %money% por tu energía.",
    "Fuiste redactor publicitario y tu eslogan fue elegido para una campaña, ganando %money% por tu ingenio.",
    "Trabajaste como costurero y reparaste ropa de alta calidad, obteniendo %money% por tu destreza."
];