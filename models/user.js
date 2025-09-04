module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, // Sequelize auto generate UUID v4
      primaryKey: true,
    },
    name: DataTypes.STRING,
    username: { type: DataTypes.STRING, unique: true },
    email: { type: DataTypes.STRING, unique: true },
    password: DataTypes.STRING,
    role: { type: DataTypes.STRING, defaultValue: 'customer' },
  }, {
    tableName: 'users',
    underscored: true,
    timestamps: true 
  })

  return User
}
