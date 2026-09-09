import { OAuth2Client } from "google-auth-library";
import pool from "../db/index.js";

const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
);

export const authenticateGoogleUser = async (idToken) => {
    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    if (!payload) {
        throw new Error("Invalid Google account");
    }

    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name || "Staff Member";

    if (!email) {
        throw new Error("Google account does not have an email");
    }

    // Find existing user
    const existingUser = await pool.query(
        `
    SELECT *
    FROM users
    WHERE google_id = $1
       OR email = $2
    LIMIT 1
    `,
        [googleId, email]
    );

    // Existing user
    if (existingUser.rows.length > 0) {
        const user = existingUser.rows[0];

        // Link Google ID if the account existed by email
        if (!user.google_id) {
            await pool.query(
                `
        UPDATE users
        SET google_id = $1
        WHERE id = $2
        `,
                [googleId, user.id]
            );
        }

        // Disabled account
        if (user.status === "disabled") {
            throw new Error("Your account has been disabled");
        }

        // Waiting for Owner approval
        if (user.status === "pending") {
            throw new Error(
                "Your account is waiting for Owner approval"
            );
        }

        // Update last login
        await pool.query(
            `
      UPDATE users
      SET last_login = CURRENT_TIMESTAMP
      WHERE id = $1
      `,
            [user.id]
        );

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status
        };
    }

    // New user
    // New staff accounts start as pending.
    const newUser = await pool.query(
        `
    INSERT INTO users (
      google_id,
      name,
      email,
      role,
      status
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,
        [
            googleId,
            name,
            email,
            "staff",
            "pending"
        ]
    );

    return {
        id: newUser.rows[0].id,
        name: newUser.rows[0].name,
        email: newUser.rows[0].email,
        role: newUser.rows[0].role,
        status: newUser.rows[0].status
    };
};