type Message = {
  title: string;
  message: string;
};

type MessagesType = {
  [key: number]: Message;
};


export const validationProcessMessages:MessagesType = {
    0: {
    title: "Estamos quase lá!",
    message: "Aguarde enquanto geramos seu currículo com carinho..."
    },
    1: {
      title: "Estamos verificando tudo certinho",
      message: "A tecnologia tem seus mistérios, mas estamos no caminho certo!"
    },
    2: {
      title: "Tentando novamente",
      message: "A persistência é o caminho para o sucesso, quase lá!"
    },
    3: {
      title: "Validando os resultados da IA",
      message: "Tente aprimorar um pouco a descrição do seu perfil, pode ajudar!"
    },
    4: {
      title: "Mais uma tentativa",
      message: "Vamos lá, estou confiante que dessa vez vai funcionar!"
    },
    5: {
      title: "Quase pronto!",
      message: "Só mais um instante, estamos verificando tudo!"
    },
    6: {
      title: "Só mais um pouquinho",
      message: "Estamos torcendo por você, logo ficará pronto!"
    },
    7: {
      title: "Ultima tentativa!",
      message: "Também estou ansiosa para ver seu currículo!"
    },
    8: {
      title: "Quase pronto!",
      message: "Só mais um instante, estamos verificando tudo!"
    },
    9: {
      title: "Poxa, não conseguimos gerar seu currículo",
      message: "Tente novamente mais tarde ou fale com o suporte, estamos aqui para ajudar!"
    }
  }

  export const errorMessages: MessagesType = {
    0: {
      title: "Opa! Não conseguimos gerar seu Currículo",
      message: "Não se preocupe, tente novamente e vamos resolver isso juntos!"
    },
    1: {
      title: "Ops! Houve um problema ao gerar o Currículo",
      message: "Dê mais uma olhada no seu perfil, pequenos ajustes podem ajudar."
    },
    2: {
      title: "Hmmm, não deu certo dessa vez",
      message: "Continue tentando, o sucesso está a apenas um clique de distância!"
    },
    3: {
      title: "Poxa, não conseguimos gerar seu currículo",
      message: "Dê mais uma olhada no seu perfil, pequenos ajustes podem ajudar."
    },
    4: {
      title: "Poxa, não conseguimos gerar seu currículo",
      message: "Dê mais uma olhada no seu perfil, pequenos ajustes podem ajudar."
    },
    5: {
      title: "Poxa, não conseguimos gerar seu currículo",
      message: "Dê mais uma olhada no seu perfil, pequenos ajustes podem ajudar."
    },
    6: {
      title: "Poxa, não conseguimos gerar seu currículo",
      message: "Dê mais uma olhada no seu perfil, pequenos ajustes podem ajudar."
    },
    7: {
      title: "Poxa, não conseguimos gerar seu currículo",
      message: "Dê mais uma olhada no seu perfil, pequenos ajustes podem ajudar."
    },
    8: {
      title: "Poxa, não conseguimos gerar seu currículo",
      message: "Dê mais uma olhada no seu perfil, pequenos ajustes podem ajudar."
    },
    9: {
      title: "Poxa, não conseguimos gerar seu currículo",
      message: "Dê mais uma olhada no seu perfil, pequenos ajustes podem ajudar."
    }
  } 