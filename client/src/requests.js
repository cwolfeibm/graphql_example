import {isLoggedIn, getAccessToken} from "./auth"
import gql from "graphql-tag"
import {ApolloClient, ApolloLink, HttpLink, InMemoryCache} from 'apollo-boost'

const enpointURL = 'http://localhost:9000/graphql'

const authLink = new ApolloLink((operation, forward) => {
  if (isLoggedIn()){
    operation.setContext({
      headers:{
        'authorization': 'Bearer ' + getAccessToken()
      }
    })
  }
  return forward(operation);
});

const client = new ApolloClient({
  link: ApolloLink.from([
    authLink,
    new HttpLink({uri: enpointURL})
  ]),
  cache: new InMemoryCache()
});

const JobDetailsFragment = gql`
  fragment JobDetails on Job
  {
        id
        title
        description
        company {
          id
          name
        }
  }
`

const jobQuery = gql`
    query JobQuery($id: ID!){
    job(id: $id) {
      ...JobDetails
      }
    }
    ${JobDetailsFragment}
`

const createJobMutation = gql`
    mutation CreateJob($input: CreateJobInput) {
      job: createJob(input: $input){
        ...JobDetails
      }
    }
    ${JobDetailsFragment}
`

export async function loadJob(id) {
    const variables = {id};
    const {data: {job}} = await client.query({query: jobQuery, variables});
    return job;
}

export async function createJob(input) {      
  const {data: {job}} = await client.mutate({
    createJobMutation, 
    variables: {input},
    update: (cache, {data}) => {
        cache.writeQuery({
          query: jobQuery,
          variables: {id: data.job.id},
          data: data
        })
    }
  });
  return job;
}

export async function loadJobs() {
    const query = gql`
        query JobsQuery{
                jobs {
                  id
                  title
                  company {
                    id
                    name
                  }
                }
            }
            `     
   
    const {data: {jobs}} = await client.query({query, fetchPolicy: 'no-cache'});
    return jobs;
}

export async function loadCompany(id) {
    const query = gql`
      query CompanyQuery($id: ID!){
        company(id: $id){
          id
          name
          description
          jobs {
            id
            title
          }
    
        }
    }
     `     
    const variables = {id}
    const {data: {company}} = await client.query({query, variables});
    return company;
}