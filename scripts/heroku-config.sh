read_dotenv()
{
  file=".env"
  while IFS="=" read -r key value; do
      heroku config:set $(echo $key | sed -e "s/^export\s*//")=$value
  done < "$file"
}

read_dotenv