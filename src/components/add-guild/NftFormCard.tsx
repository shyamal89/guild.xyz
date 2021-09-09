import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  Text,
  useColorMode,
  VStack,
} from "@chakra-ui/react"
import Card from "components/common/Card"
import { useMemo, useRef, useState } from "react"
import { useFormContext } from "react-hook-form"
import nfts from "temporaryData/nfts"
import baycMetaData from "temporaryData/nfts/metadata/bayc"
import cryptopunksMetaData from "temporaryData/nfts/metadata/cryptopunks"
import lootMetaData from "temporaryData/nfts/metadata/loot"
import { HoldTypeColors } from "temporaryData/types"
import shortenHex from "utils/shortenHex"

type Props = {
  index: number
  clickHandler?: () => void
}

const NftFormCard = ({ index, clickHandler }: Props): JSX.Element => {
  const {
    register,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext()
  const holdType = getValues(`requirements.${index}.holdType`)

  console.log(baycMetaData, cryptopunksMetaData, lootMetaData)

  const { colorMode } = useColorMode()

  const inputTimeout = useRef(null)
  const [searchInput, setSearchInput] = useState("")

  const searchResults = useMemo(() => {
    if (searchInput.length < 1) return []

    const searchText = searchInput.toLowerCase()
    const foundNFTs =
      nfts?.filter((nft) =>
        searchText.startsWith("0x")
          ? nft.address === searchText
          : nft.name.toLowerCase().includes(searchText)
      ) || []

    return foundNFTs
  }, [searchInput])

  const searchHandler = (text: string) => {
    window.clearTimeout(inputTimeout.current)
    inputTimeout.current = setTimeout(() => setSearchInput(text), 300)
  }

  return (
    <Card
      role="group"
      position="relative"
      px={{ base: 5, sm: 7 }}
      py="7"
      w="full"
      bg={colorMode === "light" ? "white" : "gray.700"}
      borderWidth={2}
      borderColor={HoldTypeColors[holdType]}
      overflow="visible"
      _before={{
        content: `""`,
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        bg: "primary.300",
        opacity: 0,
        transition: "opacity 0.2s",
      }}
    >
      <VStack spacing={4} alignItems="start">
        <FormControl
          position="relative"
          isRequired
          isInvalid={
            holdType &&
            errors.requirements &&
            errors.requirements[index] &&
            errors.requirements[index][holdType.toLowerCase()]
          }
        >
          <FormLabel>Search for an NFT or paste smart contract address:</FormLabel>
          <Input
            {...register(`requirements.${index}.nft`, {
              required: "This field is required.",
            })}
            autoComplete="off"
            onChange={(e) => searchHandler(e.target.value)}
          />
          {searchResults.length > 0 && (
            <Card
              position="absolute"
              left={0}
              top="full"
              shadow="xl"
              width="full"
              maxHeight={40}
              bgColor="gray.800"
              overflowY="auto"
              zIndex="dropdown"
            >
              <VStack spacing={1} py={2} alignItems="start">
                {searchResults.map((result, i) => (
                  <HStack
                    // eslint-disable-next-line react/no-array-index-key
                    key={i}
                    px={4}
                    py={1}
                    width="full"
                    justifyContent="space-between"
                    transition="0.2s ease"
                    cursor="pointer"
                    _hover={{ bgColor: "gray.700" }}
                    onClick={() => {
                      setValue(`requirements.${index}.nft`, searchResults[i].name)
                      searchHandler("")
                    }}
                  >
                    <Text fontWeight="semibold" as="span">
                      {result.name}
                    </Text>
                    <Text as="span" colorScheme="gray">
                      {shortenHex(result.address, 3)}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </Card>
          )}
          <FormErrorMessage>
            {errors.requirements && errors.requirements[index]?.name?.message}
          </FormErrorMessage>
        </FormControl>

        <FormControl
          isInvalid={
            errors.requirements && errors.requirements[index]?.customAttribute
          }
        >
          <FormLabel>Custom attribute:</FormLabel>
          <Input
            {...register(`requirements.${index}.customAttribute`, {
              required: "This field is required.",
            })}
          />
        </FormControl>

        <HStack width="full" alignContent="end">
          <Button
            size="sm"
            colorScheme="gray"
            ml="auto"
            onClick={typeof clickHandler === "function" && clickHandler}
          >
            Cancel
          </Button>
        </HStack>
      </VStack>
    </Card>
  )
}

export default NftFormCard