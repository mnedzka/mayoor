import React from 'react';
import { Button, InputGroup } from '@blueprintjs/core';
import { useMutation } from 'react-apollo';
import { useFormik, FormikErrors } from 'formik';
import { ApolloError } from 'apollo-client';
import { useTranslation } from 'react-i18next';

import LogoImage from '../../images/mayoor_logo.svg';
import { LoginMutation, LoginMutationVariables } from '../../__generated__/types';
import { CenteredWrapper } from '../CenteredWrapper/CenteredWrapper';
import { useAppDispatch } from '../../appContext/context';
import { LanguageSwitch } from '../LanguageSwitch/LanguageSwitch';

import { LOGIN_MUTATION } from './queries';
import * as S from './LoginForm.styles';

type FormValues = {
	username: string;
	password: string;
};

export const LoginForm: React.FC = () => {
	const dispatch = useAppDispatch();
	const { t } = useTranslation();
	const [login, { loading }] = useMutation<LoginMutation, LoginMutationVariables>(LOGIN_MUTATION);

	const { errors, handleSubmit, values, handleChange, isValid, setErrors, touched } = useFormik<
		FormValues
	>({
		initialValues: {
			username: '',
			password: '',
		},
		validate: (values) => {
			const errors: FormikErrors<FormValues> = {};
			if (!values.password) {
				errors.password = t('password_required');
			}
			if (!values.username) {
				errors.username = t('username_required');
			}
			return errors;
		},
		onSubmit: async ({ username, password }) => {
			try {
				const result = await login({ variables: { email: username, password } });
				if (result.data?.login) {
					dispatch({ type: 'SET_CURRENT_USER', user: { ...result.data.login.user } });
					localStorage.setItem('auth-token', result.data.login.token);
				}
			} catch (err) {
				if (err instanceof ApolloError) {
					if (err.graphQLErrors[0].extensions?.code === 'USER_NOT_FOUND') {
						setErrors({
							username: t('user_not_found'),
						});
					}
					if (err.graphQLErrors[0].extensions?.code === 'INVALID_PASSWORD') {
						setErrors({
							password: t('invalid_password'),
						});
					}
				}
			}
		},
	});

	return (
		<CenteredWrapper>
			<S.LoginWrapper onSubmit={handleSubmit}>
				<S.Logo src={LogoImage} />
				<S.FormGroupStyled
					helperText={touched.username && errors.username}
					intent={touched.username && errors.username ? 'danger' : 'none'}
				>
					<InputGroup
						leftIcon="user"
						placeholder={t('Username')}
						name="username"
						onChange={handleChange}
						value={values.username}
					/>
				</S.FormGroupStyled>
				<S.FormGroupStyled
					helperText={touched.password && errors.password}
					intent={touched.password && errors.password ? 'danger' : 'none'}
				>
					<InputGroup
						leftIcon="lock"
						placeholder={t('Password')}
						name="password"
						type="password"
						onChange={handleChange}
						value={values.password}
					/>
				</S.FormGroupStyled>
				<Button
					intent={'none'}
					icon={'log-in'}
					type="submit"
					fill
					loading={loading}
					disabled={!isValid}
				>
					{t('Log In')}
				</Button>
				<S.LanguageSwitchWrapper>
					<LanguageSwitch />
				</S.LanguageSwitchWrapper>
			</S.LoginWrapper>
		</CenteredWrapper>
	);
};