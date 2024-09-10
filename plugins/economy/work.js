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
    "Trabajaste como productor de video y tu trabajo fue destacado en varios medios, ganando %money% por tu esfuerzo."
]
