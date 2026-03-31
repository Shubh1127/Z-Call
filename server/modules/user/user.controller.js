import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import userModel from './user.model.js';

const THREE_DAYS_MS = 1000 * 60 * 60 * 24 * 3;

function buildCookieOptions() {
    const isProduction = process.env.NODE_ENV === 'production';

    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: THREE_DAYS_MS,
    };
}

function getOAuthClient() {
    const googleClientId = process.env.GOOGLE_CLIENT_ID;

    if (!googleClientId) {
        throw new Error('Missing GOOGLE_CLIENT_ID environment variable');
    }

    return new OAuth2Client(googleClientId);
}

export async function loginOrRegister(req, res) {
    try {
        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            return res.status(500).json({
                message: 'Server misconfigured: JWT secret is missing',
            });
        }

        const googleToken = req.body?.credential || req.body?.idToken;

        if (!googleToken) {
            return res.status(400).json({
                message: 'Google credential (idToken) is required',
            });
        }

        const oAuthClient = getOAuthClient();
        const ticket = await oAuthClient.verifyIdToken({
            idToken: googleToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload || !payload.email) {
            return res.status(401).json({
                message: 'Unable to verify Google account email',
            });
        }

        const { email, name, picture, sub } = payload;

        let user = await userModel.findOne({ email });
        let isNewUser = false;

        if (!user) {
            isNewUser = true;
            user = await userModel.create({
                name: name || email.split('@')[0],
                email,
                avatar: picture || null,
                googleId: sub,
                provider: 'google',
            });
        } else {
            if (!user.googleId && sub) {
                user.googleId = sub;
            }

            if (picture && user.avatar !== picture) {
                user.avatar = picture;
            }

            if (!user.name && name) {
                user.name = name;
            }
        }

        const token = jwt.sign(
            {
                userId: user._id.toString(),
                email: user.email,
            },
            jwtSecret,
            { expiresIn: '3d' }
        );

        user.token = token;
        await user.save();

        res.cookie('token', token, buildCookieOptions());

        return res.status(isNewUser ? 201 : 200).json({
            message: isNewUser
                ? 'User registered successfully via Google'
                : 'User logged in successfully via Google',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                provider: user.provider,
            },
            token,
        });
    } catch (error) {
        console.error('❌ Google authentication failed', error);

        const statusCode = error.message?.includes('GOOGLE_CLIENT_ID') ? 500 : 401;

        return res.status(statusCode).json({
            message: 'Unable to authenticate with Google',
            details: process.env.NODE_ENV === 'production' ? undefined : error.message,
        });
    }
}