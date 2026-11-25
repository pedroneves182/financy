import { gql } from "@apollo/client";

export const ME_QUERY = gql`query Me { me { id name email createdAt } }`;
export const CATEGORIES_QUERY = gql`query Categories { categories { id name description icon color createdAt updatedAt } }`;
export const TRANSACTIONS_QUERY = gql`query Transactions { transactions { id type description amountCents occurredAt category { id name description icon color } createdAt updatedAt } }`;
export const LOGIN_MUTATION = gql`mutation Login($email: String!, $password: String!) { login(email: $email, password: $password) { token user { id name email createdAt } } }`;
export const REGISTER_MUTATION = gql`mutation Register($name: String!, $email: String!, $password: String!) { register(name: $name, email: $email, password: $password) { token user { id name email createdAt } } }`;
export const UPDATE_PROFILE_MUTATION = gql`mutation UpdateProfile($name: String!) { updateProfile(name: $name) { id name email createdAt } }`;
export const CREATE_CATEGORY = gql`mutation CreateCategory($name: String!, $description: String, $icon: String, $color: String) { createCategory(name: $name, description: $description, icon: $icon, color: $color) { id name description icon color createdAt updatedAt } }`;
export const UPDATE_CATEGORY = gql`mutation UpdateCategory($id: ID!, $name: String!, $description: String, $icon: String, $color: String) { updateCategory(id: $id, name: $name, description: $description, icon: $icon, color: $color) { id name description icon color createdAt updatedAt } }`;
export const DELETE_CATEGORY = gql`mutation DeleteCategory($id: ID!) { deleteCategory(id: $id) }`;
export const CREATE_TRANSACTION = gql`mutation CreateTransaction($input: CreateTransactionInput!) { createTransaction(input: $input) { id type description amountCents occurredAt category { id name description icon color } createdAt updatedAt } }`;
export const UPDATE_TRANSACTION = gql`mutation UpdateTransaction($id: ID!, $input: UpdateTransactionInput!) { updateTransaction(id: $id, input: $input) { id type description amountCents occurredAt category { id name description icon color } createdAt updatedAt } }`;
export const DELETE_TRANSACTION = gql`mutation DeleteTransaction($id: ID!) { deleteTransaction(id: $id) }`;
